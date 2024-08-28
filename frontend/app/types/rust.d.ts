interface User {
  id: number;
  email: string;
  hash_password: string;
  activated: boolean;
  created_at: Date;
  updated_at: Date;
}

interface CreateUser {
  email: string;
  hash_password: string;
  activated: boolean;
}

interface UpdateUser {
  email?: string;
  hash_password?: string;
  activated?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

interface PaginationResult<T> {
  items: Array<T>;
  total_items: number;
  /** 0-based index */
  page: number;
  page_size: number;
  num_pages: number;
}

interface VideoShare {
  id: number;
  video_id: number;
  shared_by: number;
  shared_with: string;
  share_token: string;
  starts?: Date;
  expires?: Date;
  created_at?: Date;
}

interface CreateVideoShare {
  video_id: number;
  shared_by: number;
  shared_with: string;
  share_token: string;
  starts?: Date;
  expires?: Date;
}

interface UpdateVideoShare {
  video_id?: number;
  shared_by?: number;
  shared_with?: string;
  share_token?: string;
  starts?: Date;
  expires?: Date;
  created_at?: Date;
}

interface PaginationResult<T> {
  items: Array<T>;
  total_items: number;
  /** 0-based index */
  page: number;
  page_size: number;
  num_pages: number;
}

interface Video {
  video_id: number;
  user_id: number;
  file_name: string;
  course_name?: string;
  stream_url: string;
  created_at: Date;
}

interface CreateVideo {
  user_id: number;
  file_name: string;
  course_name?: string;
  stream_url: string;
}

interface UpdateVideo {
  user_id?: number;
  file_name?: string;
  course_name?: string;
  stream_url?: string;
}

interface PaginationResult<T> {
  items: Array<T>;
  total_items: number;
  /** 0-based index */
  page: number;
  page_size: number;
  num_pages: number;
}

interface Videos {
  urls: Array<string>;
  info: PaginationResult<Video>;
}

interface PaginationParams {
  page: number;
  page_size: number;
}

interface ViewParams {
  id: number;
}

interface ShareVideoRequest {
  video_id: number;
  shared_with?: string;
  starts?: string;
  expires?: string;
}
