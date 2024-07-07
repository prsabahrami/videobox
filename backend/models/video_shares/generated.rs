/* This file is generated and managed by dsync */

use crate::diesel::*;
use crate::schema::*;
use diesel::QueryResult;
use serde::{Deserialize, Serialize};
use crate::models::attachments::Attachment;
use crate::models::users::User;

type Connection = create_rust_app::Connection;

#[tsync::tsync]
#[derive(Debug, Serialize, Deserialize, Clone, Queryable, Insertable, AsChangeset, Identifiable, Associations, Selectable)]
#[diesel(table_name=video_shares, primary_key(id), belongs_to(Attachment, foreign_key=video_id) , belongs_to(User, foreign_key=shared_by))]
pub struct VideoShare {
    pub id: i32,
    pub video_id: i32,
    pub shared_by: i32,
    pub shared_with: String,
    pub share_token: uuid::Uuid,
    pub start_time: Option<chrono::DateTime<chrono::Utc>>,
    pub expires_at: Option<chrono::DateTime<chrono::Utc>>,
    pub created_at: Option<chrono::DateTime<chrono::Utc>>,
}

#[tsync::tsync]
#[derive(Debug, Serialize, Deserialize, Clone, Queryable, Insertable, AsChangeset)]
#[diesel(table_name=video_shares)]
pub struct CreateVideoShare {
    pub video_id: i32,
    pub shared_by: i32,
    pub shared_with: String,
    pub share_token: uuid::Uuid,
    pub start_time: Option<chrono::DateTime<chrono::Utc>>,
    pub expires_at: Option<chrono::DateTime<chrono::Utc>>,
}

#[tsync::tsync]
#[derive(Debug, Serialize, Deserialize, Clone, Queryable, Insertable, AsChangeset)]
#[diesel(table_name=video_shares)]
pub struct UpdateVideoShare {
    pub video_id: Option<i32>,
    pub shared_by: Option<i32>,
    pub shared_with: Option<String>,
    pub share_token: Option<uuid::Uuid>,
    pub start_time: Option<Option<chrono::DateTime<chrono::Utc>>>,
    pub expires_at: Option<Option<chrono::DateTime<chrono::Utc>>>,
    pub created_at: Option<Option<chrono::DateTime<chrono::Utc>>>,
}

#[tsync::tsync]
#[derive(Debug, Serialize)]
pub struct PaginationResult<T> {
    pub items: Vec<T>,
    pub total_items: i64,
    /// 0-based index
    pub page: i64,
    pub page_size: i64,
    pub num_pages: i64,
}

impl VideoShare {

    pub fn create(db: &mut Connection, item: &CreateVideoShare) -> QueryResult<Self> {
        use crate::schema::video_shares::dsl::*;

        insert_into(video_shares).values(item).get_result::<Self>(db)
    }

    pub fn read(db: &mut Connection, param_id: i32) -> QueryResult<Self> {
        use crate::schema::video_shares::dsl::*;

        video_shares.filter(id.eq(param_id)).first::<Self>(db)
    }

    /// Paginates through the table where page is a 0-based index (i.e. page 0 is the first page)
    pub fn paginate(db: &mut Connection, page: i64, page_size: i64) -> QueryResult<PaginationResult<Self>> {
        use crate::schema::video_shares::dsl::*;

        let page_size = if page_size < 1 { 1 } else { page_size };
        let total_items = video_shares.count().get_result(db)?;
        let items = video_shares.limit(page_size).offset(page * page_size).load::<Self>(db)?;

        Ok(PaginationResult {
            items,
            total_items,
            page,
            page_size,
            /* ceiling division of integers */
            num_pages: total_items / page_size + i64::from(total_items % page_size != 0)
        })
    }

    pub fn update(db: &mut Connection, param_id: i32, item: &UpdateVideoShare) -> QueryResult<Self> {
        use crate::schema::video_shares::dsl::*;

        diesel::update(video_shares.filter(id.eq(param_id))).set(item).get_result(db)
    }

    pub fn delete(db: &mut Connection, param_id: i32) -> QueryResult<usize> {
        use crate::schema::video_shares::dsl::*;

        diesel::delete(video_shares.filter(id.eq(param_id))).execute(db)
    }

}