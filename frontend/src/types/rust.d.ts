/* This file is generated and managed by tsync */

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

interface CreateAttachmentBlob {
  key: string;
  file_name: string;
  content_type?: string;
  byte_size: number;
  checksum: string;
  service_name: string;
}

interface UpdateAttachmentBlob {
  key?: string;
  file_name?: string;
  content_type?: string;
  byte_size?: number;
  checksum?: string;
  service_name?: string;
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
