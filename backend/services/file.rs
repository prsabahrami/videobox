use actix_multipart::Multipart;
use actix_web::{HttpResponse, ResponseError};
use actix_web::web::{Data, Path, Query, Json};
use actix_web_httpauth::extractors::bearer::BearerAuth;
use create_rust_app::{auth::controller::get_user, Attachment, AttachmentData, Database, Storage};
use ffmpeg_next::codec::traits::Encoder;
use futures_util::StreamExt as _;
use log::debug;
use tokio::process::Command;
use crate::models::videos::Video as VideoModel;
use uuid::Uuid;
use chrono::{DateTime, Utc};
use serde_json::{json, Value};
use diesel::prelude::*;
use crate::models::video_shares::VideoShare;
use crate::schema::video_shares;
use diesel::Insertable;
use ffmpeg_next::{codec, format, frame, media, software, util};
use reqwest::Client;
use std::env;
use std::io::Cursor;
use std::fs::File;
use std::io::Write;
use tempfile::NamedTempFile;
use tokio::task;
use futures_util::future::join_all;

#[derive(serde::Deserialize)]
pub struct PaginationParams {
    pub page: i64,
    pub page_size: i64,
}

#[derive(serde::Deserialize)]
pub struct ViewParams {
    pub id: i32,
}

#[derive(serde::Deserialize, Debug)]
pub struct ShareVideoRequest {
    video_id: i32,
    shared_with: Option<String>,
    starts: Option<DateTime<Utc>>,
    expires: Option<DateTime<Utc>>,
} 

#[derive(Insertable)]
#[diesel(table_name=video_shares)]
struct NewVideoShare {
    video_id: i32,
    shared_by: i32,
    shared_with: Option<String>,
    share_token: Uuid,
    starts: Option<DateTime<Utc>>,
    expires: Option<DateTime<Utc>>,
}

#[actix_web::get("/pg")]
async fn index(
    db: Data<Database>,
    Query(info): Query<PaginationParams>,
    auth: BearerAuth,
) -> HttpResponse {
    let mut con = db.get_connection().unwrap();
    
    let token = auth.token();
    let user_id = get_user(token.parse().unwrap());
    
    let result = VideoModel::paginate(&mut con, info.page, info.page_size, user_id.unwrap());

    if result.is_ok() {
        HttpResponse::Ok().json(result.unwrap())
    } else {
        HttpResponse::InternalServerError().finish()
    }
}

#[actix_web::get("/view")]
async fn view(db: Data<Database>, Query(info): Query<ViewParams>, _auth: BearerAuth) -> HttpResponse {
    let mut con = db.get_connection().unwrap();
    let result = VideoModel::read_id(&mut con, info.id);

    debug!("Hello: {:?}", result);

    if result.is_ok() {
        HttpResponse::Ok().json(result.unwrap())
    } else {
        HttpResponse::InternalServerError().finish()
    }
}

#[actix_web::delete("/{id}")]
async fn delete(db: Data<Database>, storage: Data<Storage>, file_id: Path<i32>, auth: BearerAuth) -> HttpResponse { 
    let mut db = db.get_connection().unwrap();
    let file_id = file_id.into_inner();

    let token = auth.token();
    let user_id = get_user(token.parse().unwrap());

    let detach_op = VideoModel::delete(&mut db, file_id);

    if let Err(err) = detach_op {
        return HttpResponse::InternalServerError().json(json!({ "error": err.to_string() }));
    }

    HttpResponse::Ok().finish()
}

#[actix_web::post("")]
async fn create(db: Data<Database>, store: Data<Storage>, mut payload: Multipart, auth: BearerAuth) -> HttpResponse {
    let mut db = db.get_connection().unwrap();
    let user_id = get_user(auth.token().parse().unwrap());
    
    while let Some(item) = payload.next().await {
        let mut field = if item.is_ok() {
            item.unwrap()
        } else {
            let err = item.err().unwrap();
            return err.error_response();
        };

        let content_disposition = field.content_disposition();
        let file_name = content_disposition.get_filename().map(|f| f.to_string());
        let field_name = content_disposition.get_name().unwrap();

        debug!("File Name: {:?}", file_name);
        debug!("user_id: {:?}", user_id);
        
    }

    HttpResponse::Ok().finish()
}

// #[actix_web::post("/share")]
// async fn share_video(
//     db: Data<Database>,
//     auth: BearerAuth,
//     share_req: Json<ShareVideoRequest>,
// ) -> HttpResponse {
//     let mut con = db.get_connection().unwrap();
//     let user_id = get_user(auth.token().parse().unwrap()).unwrap();
    
//     debug!("Share Request: {:?}", share_req);

//     let share_token = Uuid::new_v4();

//     let new_share = NewVideoShare {
//         video_id: share_req.video_id,
//         shared_by: user_id,
//         shared_with: share_req.shared_with.clone(),
//         share_token,
//         starts: share_req.starts.clone(),
//         expires: share_req.expires.clone(),
//     };

//     // let result = diesel::insert_into(video_shares::table)
//     //     .values(&new_share)
//     //     .get_result::<VideoShare>(&mut con);    

//     debug!("Start At: {:?}", share_req.starts);
//     debug!("Expires At: {:?}", share_req.expires);

//     // match result {
//     //     Ok(_) => HttpResponse::Ok().json(json!({ "share_token": share_token })),
//     //     Err(_) => HttpResponse::InternalServerError().finish(),
//     // }

//     HttpResponse::Ok().json(json!({ "share_token": share_token }))
// }

// #[actix_web::get("/shared/{token}")]
// async fn get_shared_video(
//     db: Data<Database>,
//     token: Path<Uuid>,
// ) -> HttpResponse {
//     use crate::schema::video_shares;
//     use crate::schema::users;

//     let mut con = db.get_connection().unwrap();
    
//     let share = video_shares::table
//         .filter(video_shares::share_token.eq(token.into_inner()))
//         .filter(video_shares::expires_at.gt(Utc::now()).or(video_shares::expires_at.is_null()))
//         .filter(video_shares::start_time.le(Utc::now()))
//         .first::<VideoShare>(&mut con);

//     let user = users::table
//         .filter(users::id.eq(share.unwrap().shared_by))
//         .first::<User>(&mut con);

//     if share.unwrap().shared_with != user.unwrap().email {
//         return HttpResponse::Forbidden().finish();
//     }

//     match share {
//         Ok(share) => {
//             let video = AttachmentModel::read_id(&mut con, share.video_id).unwrap();
//             HttpResponse::Ok().json(json!({
//                 "video": video,
//                 "start_time": share.start_time,
//                 "shared_by": share.shared_by,
//                 "shared_with": share.shared_with
//             }))
//         },
//         Err(_) => HttpResponse::NotFound().finish(),
//     }
// }

pub fn endpoints(scope: actix_web::Scope) -> actix_web::Scope {
    scope
        .service(create)
        .service(delete)
        .service(index)
        .service(view)
        // .service(share_video)
        // .service(get_shared_video);
}