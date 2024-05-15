# Videobox - Secure and Expirable Video Sharing

Videobox is a web application designed to share class recordings securely and efficiently, providing educators and students with expirable link-based access without the need for downloads. This project aims to overcome the limitations of mainstream cloud services, which can be costly and may require users to fetch entire video content before playing.

## Motivation

The inception of Videobox arose from the need for a simple, efficient way to share educational content that doesn't compromise on security and accessibility. Unlike services like Google Drive or Dropbox, Videobox allows instant streaming without full download and without requiring a specific email service account (Unlile Google Drive), making it ideal for educational environments.

## Built With

- **Actix/Rust**: Robust framework for building efficient and reliable backend services.
- **React**: A JavaScript library for building user interfaces, ensuring a responsive and dynamic frontend.
- **Diesel**: ORM used for database operations, primarily with PostgreSQL to manage user information securely and efficiently.
- **AWS S3**: Utilized for secure and scalable storage of video files through multipart uploads.
- **EvaporateJS**: (Considering) A JavaScript library for directly uploading files from a browser to AWS S3, enhancing the upload process with resilience to network failures.

This project was bootstrapped with [Create Rust App](https://github.com/wulf/create-rust-app).

## Requirements

- [Stable Rust](https://www.rust-lang.org/tools/install)
- Diesel CLI
  - For PostgreSQL: `cargo install diesel_cli --no-default-features --features postgres`
  - For SQLite: `cargo install diesel_cli --no-default-features --features sqlite-bundled`
- `cargo-watch`: To recompile on change, run `cargo install cargo-watch`

## Setup

First, ensure that the `.env` file is properly configured according to the `.env.example` provided. This will configure your local environment variables necessary for development and production.

### Running the App

1. **Run in Development Mode:**
   ```sh
   cargo fullstack
