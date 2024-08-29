package models

import (
    "time"
)

type ShareVideoRequest struct {
    VideoID    int       `json:"video_id" binding:"required"`
    SharedWith *string   `json:"shared_with"`
    Starts     *time.Time `json:"starts"`
    Expires    *time.Time `json:"expires"`
}
