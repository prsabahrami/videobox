package models

type ShareVideoRequest struct {
    VideoID    int    `json:"videoId" binding:"required"`
    SharedWith string `json:"sharedWith" binding:"required"`
    CourseName string `json:"courseName" binding:"required"`
    Starts     string `json:"starts"`
    Expires    string `json:"expires"`
}