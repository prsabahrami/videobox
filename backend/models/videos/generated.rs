use crate::diesel::*;
use crate::schema::*;
use diesel::QueryResult;
use serde::{Deserialize, Serialize};
use crate::models::users::User;

type Connection = create_rust_app::Connection;

type ID = i32;

#[derive(Debug, Serialize, Deserialize, Clone, Queryable, Insertable, AsChangeset, Identifiable, Associations, Selectable)]
#[diesel(table_name=videos, primary_key(video_id), belongs_to(User, foreign_key=user_id))]
pub struct Video {
    pub video_id: i32,
    pub user_id: i32,
    pub file_name: String,
    pub course_name: Option<String>,
    pub stream_url: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Serialize, Deserialize, Clone, Queryable, Insertable, AsChangeset)]
#[diesel(table_name=videos)]
pub struct CreateVideo {
    pub user_id: i32,
    pub file_name: String,
    pub course_name: Option<String>,
    pub stream_url: String,
}

#[derive(Debug, Serialize, Deserialize, Clone, Queryable, Insertable, AsChangeset)]
#[diesel(table_name=videos)]
pub struct UpdateVideo {
    pub user_id: Option<i32>,
    pub file_name: Option<String>,
    pub course_name: Option<String>,
    pub stream_url: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct PaginationResult<T> {
    pub items: Vec<T>,
    pub total_items: i64,
    /// 0-based index
    pub page: i64,
    pub page_size: i64,
    pub num_pages: i64,
}

#[derive(Debug, Serialize)]
pub struct Videos {
    pub urls: Vec<String>,
    pub info: PaginationResult<Video>,
}

impl Video {

    pub fn create(db: &mut Connection, item: &CreateVideo) -> QueryResult<Self> {
        use crate::schema::videos::dsl::*;

        insert_into(videos).values(item).get_result::<Self>(db)
    }

    pub fn read(db: &mut Connection, param_id: i32) -> QueryResult<Self> {
        use crate::schema::videos::dsl::*;

        videos.filter(video_id.eq(param_id)).first::<Self>(db)
    }

    pub fn read_id(db: &mut Connection, param_id: i32) -> QueryResult<String> {
        use crate::schema::videos::dsl::{videos, video_id, stream_url};

        let file_key = videos
            .filter(video_id.eq(param_id))
            .select(stream_url)
            .first::<String>(db)?;

        let url = format!("{}/{}", std::env::var("CLOUDFRONT_URL").unwrap(), file_key);

        Ok(url)
    }
    
    /// Paginates through the table where page is a 0-based index (i.e. page 0 is the first page)
    pub fn paginate(db: &mut Connection, page: i64, page_size: i64, user_id_input: ID) -> QueryResult<PaginationResult<Video>> {
        use crate::schema::videos::dsl::*;

        let page_size = if page_size < 1 { 1 } else { page_size };
        let total_items = videos.count().get_result(db)?;
        let items = videos.filter(user_id.eq(user_id_input)).limit(page_size).offset(page * page_size).load::<Self>(db)?;
        
        Ok(PaginationResult {
            items,
            total_items,
            page,
            page_size,
            num_pages: total_items / page_size + i64::from(total_items % page_size != 0)
        })
    }

    pub fn update(db: &mut Connection, param_id: i32, item: &UpdateVideo) -> QueryResult<Self> {
        use crate::schema::videos::dsl::*;

        diesel::update(videos.filter(video_id.eq(param_id))).set(item).get_result(db)
    }

    pub fn delete(db: &mut Connection, param_id: i32) -> QueryResult<usize> {
        use crate::schema::videos::dsl::*;

        diesel::delete(videos.filter(video_id.eq(param_id))).execute(db)
    }

}