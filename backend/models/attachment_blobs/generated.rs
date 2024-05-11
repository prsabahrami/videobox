/* This file is generated and managed by dsync */

use crate::diesel::*;
use crate::schema::*;
use diesel::QueryResult;
use serde::{Deserialize, Serialize};


type Connection = create_rust_app::Connection;

#[tsync::tsync]
#[derive(Debug, Serialize, Deserialize, Clone, Queryable, Insertable, AsChangeset, Selectable)]
#[diesel(table_name=attachment_blobs, primary_key(id))]
pub struct AttachmentBlob {
    pub id: i32,
    pub key: String,
    pub file_name: String,
    pub content_type: Option<String>,
    pub byte_size: i64,
    pub checksum: String,
    pub service_name: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

#[tsync::tsync]
#[derive(Debug, Serialize, Deserialize, Clone, Queryable, Insertable, AsChangeset)]
#[diesel(table_name=attachment_blobs)]
pub struct CreateAttachmentBlob {
    pub key: String,
    pub file_name: String,
    pub content_type: Option<String>,
    pub byte_size: i64,
    pub checksum: String,
    pub service_name: String,
}

#[tsync::tsync]
#[derive(Debug, Serialize, Deserialize, Clone, Queryable, Insertable, AsChangeset)]
#[diesel(table_name=attachment_blobs)]
pub struct UpdateAttachmentBlob {
    pub key: Option<String>,
    pub file_name: Option<String>,
    pub content_type: Option<Option<String>>,
    pub byte_size: Option<i64>,
    pub checksum: Option<String>,
    pub service_name: Option<String>,
    pub created_at: Option<chrono::DateTime<chrono::Utc>>,
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

impl AttachmentBlob {

    pub fn create(db: &mut Connection, item: &CreateAttachmentBlob) -> QueryResult<Self> {
        use crate::schema::attachment_blobs::dsl::*;

        insert_into(attachment_blobs).values(item).get_result::<Self>(db)
    }

    pub fn read(db: &mut Connection, param_id: i32) -> QueryResult<Self> {
        use crate::schema::attachment_blobs::dsl::*;

        attachment_blobs.filter(id.eq(param_id)).first::<Self>(db)
    }

    /// Paginates through the table where page is a 0-based index (i.e. page 0 is the first page)
    pub fn paginate(db: &mut Connection, page: i64, page_size: i64) -> QueryResult<PaginationResult<Self>> {
        use crate::schema::attachment_blobs::dsl::*;

        let page_size = if page_size < 1 { 1 } else { page_size };
        let total_items = attachment_blobs.count().get_result(db)?;
        let items = attachment_blobs.limit(page_size).offset(page * page_size).load::<Self>(db)?;

        Ok(PaginationResult {
            items,
            total_items,
            page,
            page_size,
            /* ceiling division of integers */
            num_pages: total_items / page_size + i64::from(total_items % page_size != 0)
        })
    }

    pub fn update(db: &mut Connection, param_id: i32, item: &UpdateAttachmentBlob) -> QueryResult<Self> {
        use crate::schema::attachment_blobs::dsl::*;

        diesel::update(attachment_blobs.filter(id.eq(param_id))).set(item).get_result(db)
    }

    pub fn delete(db: &mut Connection, param_id: i32) -> QueryResult<usize> {
        use crate::schema::attachment_blobs::dsl::*;

        diesel::delete(attachment_blobs.filter(id.eq(param_id))).execute(db)
    }

}