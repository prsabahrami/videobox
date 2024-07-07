// @generated automatically by Diesel CLI.

diesel::table! {
    attachment_blobs (id) {
        id -> Int4,
        key -> Text,
        file_name -> Text,
        content_type -> Nullable<Text>,
        byte_size -> Int8,
        checksum -> Text,
        service_name -> Text,
        created_at -> Timestamptz,
    }
}

diesel::table! {
    attachments (id) {
        id -> Int4,
        user_id -> Int4,
        name -> Text,
        record_type -> Text,
        record_id -> Int4,
        blob_id -> Int4,
        created_at -> Timestamptz,
    }
}

diesel::table! {
    role_permissions (role, permission) {
        role -> Text,
        permission -> Text,
        created_at -> Timestamptz,
    }
}

diesel::table! {
    user_oauth2_links (id) {
        id -> Int4,
        provider -> Text,
        csrf_token -> Text,
        nonce -> Text,
        pkce_secret -> Text,
        refresh_token -> Nullable<Text>,
        access_token -> Nullable<Text>,
        subject_id -> Nullable<Text>,
        user_id -> Nullable<Int4>,
        created_at -> Timestamptz,
        updated_at -> Timestamptz,
    }
}

diesel::table! {
    user_permissions (user_id, permission) {
        user_id -> Int4,
        permission -> Text,
        created_at -> Timestamptz,
    }
}

diesel::table! {
    user_roles (user_id, role) {
        user_id -> Int4,
        role -> Text,
        created_at -> Timestamptz,
    }
}

diesel::table! {
    user_sessions (id) {
        id -> Int4,
        user_id -> Int4,
        refresh_token -> Text,
        device -> Nullable<Text>,
        created_at -> Timestamptz,
        updated_at -> Timestamptz,
    }
}

diesel::table! {
    users (id) {
        id -> Int4,
        email -> Text,
        hash_password -> Text,
        activated -> Bool,
        created_at -> Timestamptz,
        updated_at -> Timestamptz,
    }
}

diesel::table! {
    video_shares (id) {
        id -> Int4,
        video_id -> Int4,
        shared_by -> Int4,
        shared_with -> Text,
        share_token -> Uuid,
        starts -> Nullable<Timestamptz>,
        expires -> Nullable<Timestamptz>,
        created_at -> Nullable<Timestamptz>,
    }
}

diesel::joinable!(attachments -> users (user_id));
diesel::joinable!(user_oauth2_links -> users (user_id));
diesel::joinable!(user_permissions -> users (user_id));
diesel::joinable!(user_roles -> users (user_id));
diesel::joinable!(user_sessions -> users (user_id));
diesel::joinable!(video_shares -> attachments (video_id));
diesel::joinable!(video_shares -> users (shared_by));

diesel::allow_tables_to_appear_in_same_query!(
    attachment_blobs,
    attachments,
    role_permissions,
    user_oauth2_links,
    user_permissions,
    user_roles,
    user_sessions,
    users,
    video_shares,
);
