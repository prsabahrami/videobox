package controllers 

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/prsabahrami/videobox/backend/config"
	"github.com/prsabahrami/videobox/backend/models"
)

func CreateCourse(c *gin.Context) {
	db := config.DB

	var req struct {
		Name        string `json:"name" binding:"required"`
		Description string `json:"description" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
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

	course := models.Course{
		Name:        req.Name,
		Description: req.Description,
		UserID:      uint(userClaims.Sub),
	}

	if err := db.Create(&course).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"id": course.ID, "name": course.Name, "description": course.Description})
}

func GetCourses(c *gin.Context) {
	db := config.DB

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

	var courses []models.Course
	if err := db.Where("user_id = ?", userClaims.Sub).Find(&courses).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var courseNames []string
	for _, course := range courses {
		courseNames = append(courseNames, course.Name)
	}

	c.JSON(http.StatusOK, courseNames)
}