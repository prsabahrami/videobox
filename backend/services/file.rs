use actix_multipart::Multipart;
use actix_web::{HttpResponse, ResponseError};
use actix_web::web::{Data, Path, Query, Json};
use actix_web_httpauth::extractors::bearer::BearerAuth;
use serde::Serialize;
use create_rust_app::{auth::controller::get_user, Attachment, AttachmentData, Database, Storage};
use futures_util::StreamExt as _;
use log::debug;
use crate::services::attachments::Attachment as AttachmentModel;
use uuid::Uuid;
use chrono::{DateTime, Utc};
use serde_json::json;
use diesel::prelude::*;
use crate::models::video_shares::VideoShare;
use crate::schema::video_shares;
use diesel::Insertable;

#[derive(Serialize)]
#[tsync::tsync]
#[allow(dead_code)]
struct FileInfo {
    pub id: i32,
    pub key: String,
    pub name: String,
    pub url: Option<String>,
}

#[tsync::tsync]
#[derive(serde::Deserialize)]
pub struct PaginationParams {
    pub page: i64,
    pub page_size: i64,
}

#[tsync::tsync]
#[derive(serde::Deserialize)]
pub struct ViewParams {
    pub id: i32,
}

#[tsync::tsync]
#[derive(serde::Deserialize)]
pub struct ShareVideoRequest {
    video_id: i32,
    shared_with: Option<String>,
    start_time: Option<DateTime<Utc>>,
    expires_at: Option<DateTime<Utc>>,
}

#[derive(Insertable)]
#[diesel(table_name=video_shares)]
struct NewVideoShare {
    video_id: i32,
    shared_by: i32,
    shared_with: Option<String>,
    share_token: Uuid,
    start_time: Option<DateTime<Utc>>,
    expires_at: Option<DateTime<Utc>>,
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
    
    let result = AttachmentModel::paginate(&mut con, info.page, info.page_size, user_id.unwrap());

    if result.is_ok() {
        HttpResponse::Ok().json(result.unwrap())
    } else {
        HttpResponse::InternalServerError().finish()
    }
}

#[actix_web::get("/view")]
async fn view(db: Data<Database>, Query(info): Query<ViewParams>, _auth: BearerAuth) -> HttpResponse {
    let mut con = db.get_connection().unwrap();
    let result = AttachmentModel::read_id(&mut con, info.id);

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

    let detach_op = Attachment::detach(&mut db, &storage, file_id, user_id.unwrap()).await;

    if detach_op.is_err() {
        return HttpResponse::InternalServerError().json(detach_op.err().unwrap());
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
        let field_name = content_disposition
            .get_name().unwrap();

        match field_name {
            "file" => {
                let mut data = Vec::new();
                while let Some(chunk) = field.next().await {
                    data.extend_from_slice(&chunk.unwrap()[..]);
                }

                let attached_req = Attachment::attach(&mut db, &store, user_id.unwrap(), file_name.clone().unwrap(), "NULL".to_string(), 0, AttachmentData {
                    data: data.clone(),
                    file_name: file_name.clone(),
                }, true, false).await;

                if attached_req.is_err() {
                    debug!("Error attaching file: {:?}", attached_req);
                    return HttpResponse::InternalServerError().json(attached_req.err().unwrap());
                }
            },
            _ => {}
        }
    }

    HttpResponse::Ok().finish()
}

#[actix_web::post("/share")]
async fn share_video(
    db: Data<Database>,
    auth: BearerAuth,
    share_req: Json<ShareVideoRequest>,
) -> HttpResponse {
    use crate::schema::video_shares;

    let mut con = db.get_connection().unwrap();
    let user_id = get_user(auth.token().parse().unwrap()).unwrap();
    
    let share_token = Uuid::new_v4();

    let new_share = NewVideoShare {
        video_id: share_req.video_id,
        shared_by: user_id,
        shared_with: share_req.shared_with.clone(),
        share_token,
        start_time: share_req.start_time,
        expires_at: share_req.expires_at,
    };

    let result = diesel::insert_into(video_shares::table)
        .values(&new_share)
        .get_result::<VideoShare>(&mut con);    

    debug!("{:?}", result);

    match result {
        Ok(_) => HttpResponse::Ok().json(json!({ "share_token": share_token })),
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}

#[actix_web::get("/shared/{token}")]
async fn get_shared_video(
    db: Data<Database>,
    token: Path<Uuid>,
) -> HttpResponse {
    use crate::schema::video_shares;

    let mut con = db.get_connection().unwrap();
    
    let share = video_shares::table
        .filter(video_shares::share_token.eq(token.into_inner()))
        .filter(video_shares::expires_at.gt(Utc::now()).or(video_shares::expires_at.is_null()))
        .first::<VideoShare>(&mut con);

    match share {
        Ok(share) => {
            let video = AttachmentModel::read_id(&mut con, share.video_id).unwrap();
            HttpResponse::Ok().json(json!({
                "video": video,
                "start_time": share.start_time,
                "shared_by": share.shared_by,
                "shared_with": share.shared_with
            }))
        },
        Err(_) => HttpResponse::NotFound().finish(),
    }
}

pub fn endpoints(scope: actix_web::Scope) -> actix_web::Scope {
    return scope
        .service(create)
        .service(delete)
        .service(index)
        .service(view)
        .service(share_video)
        .service(get_shared_video);
}