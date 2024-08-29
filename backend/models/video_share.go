package models

import (
    "time"
    "github.com/google/uuid"
)

type VideoShare struct {
    VideoID    int        `gorm:"primaryKey"`
    SharedBy   int        `gorm:"primaryKey"`
    SharedWith *string
    ShareToken uuid.UUID
    Starts     *time.Time
    Expires    *time.Time
    CreatedAt  time.Time
}

type NewVideoShare struct {
    VideoID    int
    SharedBy   int
    SharedWith *string
    ShareToken uuid.UUID
    Starts     *time.Time
    Expires    *time.Time
}
