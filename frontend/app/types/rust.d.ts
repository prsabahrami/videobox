/* This file is generated and managed by tsync */

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

interface Attachment {
  id: number;
  user_id: number;
  name: string;
  record_type: string;
  record_id: number;
  blob_id: number;
  created_at: Date;
}

interface AttachmentBlob {
  id: number;
  key: string;
  file_name: string;
  content_type?: string;
  byte_size: number;
  checksum: string;
  service_name: string;
  created_at: Date;
}

interface CreateAttachment {
  user_id: number;
  name: string;
  record_type: string;
  record_id: number;
  blob_id: number;
}

interface UpdateAttachment {
  user_id?: number;
  name?: string;
  record_type?: string;
  record_id?: number;
  blob_id?: number;
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

interface FileInfo {
  id: number;
  key: string;
  name: string;
  url?: string;
}

interface PaginationParams {
  page: number;
  page_size: number;
}
