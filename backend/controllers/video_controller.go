package controllers

import (
	"fmt"
	"net/http"
    "os"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/morkid/paginate"
	"github.com/prsabahrami/videobox/backend/config"
	"github.com/prsabahrami/videobox/backend/models"
	"github.com/prsabahrami/videobox/backend/utils"
	"gorm.io/gorm"
)

type CreateVideoRequest struct {
	FileName string `json:"file_name"`
	CourseName string `json:"course_name"`
}

// Index: Paginate and list videos
func Index(c *gin.Context) {
    db := config.DB
    model := db.Model(&models.Video{})
    
    pg := paginate.New()
    results := pg.With(model).Request(c.Request).Response(&[]models.Video{})

    c.JSON(http.StatusOK, results)
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

    if err := db.Delete(&models.Video{}, id).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
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
	
	video := models.Video{
		UserID:   uint(userClaims.Sub),
		FileName: req.FileName,
		CourseID: course.ID,
	}

    if err := db.Create(&video).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

	objectName := fmt.Sprintf("%d/%s/%s", video.UserID, req.CourseName, video.FileName)
	
	// Generate signed URL
	signedURL, err := utils.GenerateSignedURL(objectName)
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

    db := config.DB
    newShare := models.NewVideoShare{
        VideoID:    req.VideoID,
        SharedBy:   1, // Replace with actual user ID
        SharedWith: req.SharedWith,
        ShareToken: uuid.New(),
        Starts:     req.Starts,
        Expires:    req.Expires,
    }

    if err := db.Create(&newShare).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, gin.H{"share_token": newShare.ShareToken})
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
        FileName string `json:"file_name"`
        CourseName string `json:"course_name"`
    }

    claims, ok := c.Get("user")
    if !ok {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
        return
    }

    userClaims, ok := claims.(*models.AccessTokenClaims)
    if !ok {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse user claims"})
        return
    }

    var req TranscodeRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    inputURI := fmt.Sprintf("gs://%s/%d/%s/%s", os.Getenv("GCS_BUCKET"), userClaims.Sub, req.CourseName, req.FileName)
    outputURI := fmt.Sprintf("gs://%s/transcoded/%d/%s/%s/", os.Getenv("GCS_BUCKET"), userClaims.Sub, req.CourseName, req.FileName)

    err := utils.CreateJobFromPreset(inputURI, outputURI)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

}