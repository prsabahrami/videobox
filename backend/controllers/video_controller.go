package controllers

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/prsabahrami/videobox/backend/config"
	"github.com/prsabahrami/videobox/backend/middleware"
	"github.com/prsabahrami/videobox/backend/models"
	"github.com/prsabahrami/videobox/backend/utils"
	"gorm.io/gorm"
)

type CreateVideoRequest struct {
	FileName string `json:"file_name"`
	CourseName string `json:"course_name"`
}
// Index: List videos
func Index(c *gin.Context) {
    db := config.DB
    
    claims, exists := c.Get("user")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
        return
    }
    userClaims, ok := claims.(*models.AccessTokenClaims)
    if !ok {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user claims"})
        return
    }

    // Fetch courses for the user
    var courses []models.Course
    if err := db.Where("user_id = ?", userClaims.Sub).Find(&courses).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch courses"})
        return
    }

    // Create a map of course IDs to course names
    courseMap := make(map[uint]string)
    for _, course := range courses {
        courseMap[course.ID] = course.Name
    }

    // Fetch videos for the user
    var videos []models.Video
    if err := db.Where("user_id = ?", userClaims.Sub).Find(&videos).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch videos"})
        return
    }

    // Prepare video data including course names
    videosWithCourseNames := make([]gin.H, len(videos))
    for i, video := range videos {
        videosWithCourseNames[i] = gin.H{
            "id":        video.ID,
            "fileName":  video.FileName,
            "courseName": courseMap[video.CourseID],
            "createdAt": video.CreatedAt,
            "playbackId": video.PlaybackID,
            "duration": video.Duration,
        }
    }

    c.JSON(http.StatusOK, videosWithCourseNames)
}

// View: View a specific video by ID
func View(c *gin.Context) {
    var params models.ViewParams
    if err := c.ShouldBindQuery(&params); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    var video models.Video
    db := config.DB

    if err := db.First(&video, params.ID).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusOK, video)
}

// Delete: Delete a specific video by ID
func Delete(c *gin.Context) {
    db := config.DB
    id := c.Param("id")

    // Fetch the video to get the Mux asset ID
    var video models.Video
    if err := db.First(&video, id).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Video not found"})
        return
    }

    // Delete the video from Mux
    if err := utils.DeleteVideo(video.MuxAssetID); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to delete video from Mux %s", err.Error())})
        return
    }

    // Delete the video from the database
    if err := db.Delete(&video).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to delete video from database %s", err.Error())})
        return
    }

    c.Status(http.StatusNoContent)
}

// Create: Upload a video
func Create(c *gin.Context) {
    fmt.Println("Create video")
	db := config.DB
	var req CreateVideoRequest

    if err := c.ShouldBind(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

	claims, exists := c.Get("user")

	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	userClaims, ok := claims.(*models.AccessTokenClaims)

	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse user claims"})
		return
	}

	// Find the course ID from the course name
	var course models.Course
	if err := db.Where("name = ?", req.CourseName).First(&course).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Course not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to find course"})
		}
		return
	}

	objectName := fmt.Sprintf("%d/%s/%s", userClaims.Sub, req.CourseName, req.FileName)
	
	// Generate signed URL
	signedURL, err := utils.GenerateSignedURL(objectName, "POST")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate signed URL"})
		return
	}

    c.JSON(http.StatusCreated, gin.H{"signedURL": signedURL})
}

// ShareVideo: Share a video with another user
func ShareVideo(c *gin.Context) {
    var req models.ShareVideoRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    claims, exists := c.Get("user")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
        return
    }
    userClaims, ok := claims.(*models.AccessTokenClaims)
    if !ok {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse user claims"})
        return
    }

    // Parse the time strings
    var starts, expires *time.Time
    if req.Starts != "" {
        t, err := time.Parse(time.RFC3339, req.Starts)
        if err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid start time format"})
            return
        }
        starts = &t
    }
    if req.Expires != "" {
        t, err := time.Parse(time.RFC3339, req.Expires)
        if err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid expiration time format"})
            return
        }
        expires = &t
    }

    // Create JWT claims
    mapClaims := &jwt.MapClaims{
        "video_id":    req.VideoID,
        "shared_by":   userClaims.Sub,
        "shared_with": req.SharedWith,
        "starts":      starts,
        "expires":     expires,
        "exp":         time.Now().Add(time.Hour * 24).Unix(), // Token expires in 24 hours
    }

    // Generate token using GenerateTokenFromClaims
    tokenString, err := middleware.GenerateTokenFromClaims(mapClaims)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
        return
    }

    db := config.DB
    newShare := models.VideoShare{
        VideoID:    req.VideoID,
        SharedBy:   userClaims.Sub,
        SharedWith: req.SharedWith,
        CourseName: req.CourseName,
        ShareToken: tokenString,
        Starts:     starts,
        Expires:    expires,
    }

    if err := db.Create(&newShare).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create share: " + err.Error()})
        return
    }

    var user models.User
    if err := db.First(&user, userClaims.Sub).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    err = middleware.SendVideoSharedEmail(req.SharedWith, user.Email, req.CourseName, tokenString)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send email"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"share_token": tokenString})
}

// GetSharedVideo: Retrieve a shared video by token
func GetSharedVideo(c *gin.Context) {
    token := c.Param("token")
    var share models.VideoShare

    db := config.DB
    if err := db.Where("share_token = ?", token).First(&share).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Share not found"})
        return
    }

    var video models.Video
    if err := db.First(&video, share.VideoID).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    var user models.User
    if err := db.First(&user, share.SharedBy).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    err := middleware.SendVideoSharedEmail(share.SharedWith, user.Email, share.CourseName, share.ShareToken)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send email"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "video":      video,
        "start_time": share.Starts,
        "shared_by":  share.SharedBy,
        "shared_with": share.SharedWith,
    })
}

func Transcode(c *gin.Context) {
    fmt.Println("Transcode video")
    type TranscodeRequest struct {
        FileName   string `json:"file_name"`
        CourseName string `json:"course_name"`
    }
    var req TranscodeRequest
   
    if err := c.ShouldBind(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    claims, exists := c.Get("user")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
        return
    }
    userClaims, ok := claims.(*models.AccessTokenClaims)
    if !ok {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse user claims"})
        return
    }

    objectName := fmt.Sprintf("%d/%s/%s", userClaims.Sub, req.CourseName, req.FileName)
    signedURL, err := utils.GenerateSignedURL(objectName, "GET")
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }   

    fmt.Println("Signed URL", signedURL)

    db := config.DB

    // Find the course ID from the course name
    var course models.Course
    if err := db.Where("name = ?", req.CourseName).First(&course).Error; err != nil {
        if err == gorm.ErrRecordNotFound {
            c.JSON(http.StatusNotFound, gin.H{"error": "Course not found"})
        } else {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to find course"})
        }
        return
    }

    duration, assetId, playbackId, err := utils.UploadVideo(signedURL)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    // Create a new video record in the database
    video := models.Video{
        UserID:     uint(userClaims.Sub),
        FileName:   req.FileName,
        CourseID:   course.ID,
        MuxAssetID: assetId,
        PlaybackID: playbackId,
        Duration:   duration,
    }

    if err := db.Create(&video).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create video record"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"playback_id": playbackId})
}