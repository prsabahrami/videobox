use crate::diesel::*;
use crate::schema::*;
use diesel::QueryResult;
use serde::{Deserialize, Serialize};
use crate::models::users::User;

type Connection = create_rust_app::Connection;

type ID = i32;

#[tsync::tsync]
#[derive(Debug, Serialize, Deserialize, Clone, Queryable, Insertable, AsChangeset, Identifiable, Associations, Selectable)]
#[diesel(table_name=attachments, primary_key(id), belongs_to(User, foreign_key=user_id))]
pub struct Attachment {
    pub id: i32,
    pub user_id: i32,
    pub name: String,
    pub record_type: String,
    pub record_id: i32,
    pub blob_id: i32,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

#[tsync::tsync]
#[derive(Debug, Serialize, Deserialize, Clone, Queryable, Insertable, AsChangeset)]
#[diesel(table_name=attachments)]
pub struct CreateAttachment {
    pub user_id: i32,
    pub name: String,
    pub record_type: String,
    pub record_id: i32,
    pub blob_id: i32,
}

#[tsync::tsync]
#[derive(Debug, Serialize, Deserialize, Clone, Queryable, Insertable, AsChangeset)]
#[diesel(table_name=attachments)]
pub struct UpdateAttachment {
    pub user_id: Option<i32>,
    pub name: Option<String>,
    pub record_type: Option<String>,
    pub record_id: Option<i32>,
    pub blob_id: Option<i32>,
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

impl Attachment {

    pub fn create(db: &mut Connection, item: &CreateAttachment) -> QueryResult<Self> {
        use crate::schema::attachments::dsl::*;

        insert_into(attachments).values(item).get_result::<Self>(db)
    }

    pub fn read(db: &mut Connection, param_id: i32) -> QueryResult<Self> {
        use crate::schema::attachments::dsl::*;

        attachments.filter(id.eq(param_id)).first::<Self>(db)
    }

    /// Paginates through the table where page is a 0-based index (i.e. page 0 is the first page)
    pub fn paginate(db: &mut Connection, page: i64, page_size: i64, user_id: ID) -> QueryResult<PaginationResult<Self>> {
        use crate::schema::attachments::dsl::*;

        let page_size = if page_size < 1 { 1 } else { page_size };
        let total_items = attachments.count().get_result(db)?;
        let items = attachments.filter(user_id.eq(user_id)).limit(page_size).offset(page * page_size).load::<Self>(db)?;

        Ok(PaginationResult {
            items,
            total_items,
            page,
            page_size,
            /* ceiling division of integers */
            num_pages: total_items / page_size + i64::from(total_items % page_size != 0)
        })
    }

    pub fn update(db: &mut Connection, param_id: i32, item: &UpdateAttachment) -> QueryResult<Self> {
        use crate::schema::attachments::dsl::*;

        diesel::update(attachments.filter(id.eq(param_id))).set(item).get_result(db)
    }

    pub fn delete(db: &mut Connection, param_id: i32) -> QueryResult<usize> {
        use crate::schema::attachments::dsl::*;

        diesel::delete(attachments.filter(id.eq(param_id))).execute(db)
    }

}