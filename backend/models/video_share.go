package models

import (
    "time"
)

type VideoShare struct {
    VideoID    int        `gorm:"primaryKey"`
    SharedBy   int        `gorm:"primaryKey"`
    SharedWith string
    ShareToken string
    CourseName string
    Starts     *time.Time
    Expires    *time.Time
    CreatedAt  time.Time
}

type NewVideoShare struct {
    VideoID    int
    SharedBy   int
    SharedWith string
    ShareToken string
    CourseName string
    Starts     *time.Time
    Expires    *time.Time
}
