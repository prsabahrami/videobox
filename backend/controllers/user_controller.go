package controllers

import (
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/prsabahrami/videobox/backend/config"
	"github.com/prsabahrami/videobox/backend/models"
	"github.com/prsabahrami/videobox/backend/middleware"
	"golang.org/x/crypto/bcrypt"
)

const COOKIE_NAME = "refresh_token"

type LoginInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type RegisterInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
	Role     string `json:"role" binding:"required"`
}

type ActivationInput struct {
	ActivationToken string `json:"activationToken" binding:"required"`
}

type ForgotInput struct {
	Email string `json:"email" binding:"required,email"`
}

type ChangeInput struct {
	OldPassword string `json:"old_password" binding:"required"`
	NewPassword string `json:"new_password" binding:"required"`
}

type ResetInput struct {
	ResetToken  string `json:"reset_token" binding:"required"`
	NewPassword string `json:"new_password" binding:"required"`
}

func CreateUserSession(ttl int, userID int, userRole models.Role) (string, string, error) {
	accessTokenDuration := time.Duration(func(ttl int) int {
		if ttl == 0 {
			return 15 * 60
		}
		return max(ttl, 1)
	}(ttl)) * time.Second

	accessTokenClaims := models.AccessTokenClaims{
		Exp:       time.Now().Add(accessTokenDuration).Unix(),
		Sub:       userID,
		Role:      userRole,
		TokenType: "access_token",
	}	

	refreshTokenClaims := models.RefreshTokenClaims{
		Exp:       time.Now().Add(time.Hour * 24 * 30).Unix(),
		Sub:       userID,
		Role:      userRole,
		TokenType: "refresh_token",
	}

	accessTokenClaimsMap := jwt.MapClaims{
		"exp":        accessTokenClaims.Exp,
		"sub":        accessTokenClaims.Sub,
		"role":       accessTokenClaims.Role,
		"token_type": accessTokenClaims.TokenType,
	}

	accessToken, err := middleware.GenerateTokenFromClaims(&accessTokenClaimsMap)
	if err != nil {
		return "", "", err
	}

	refreshTokenClaimsMap := jwt.MapClaims{
		"exp":        refreshTokenClaims.Exp,
		"sub":        refreshTokenClaims.Sub,
		"role":       refreshTokenClaims.Role,
		"token_type": refreshTokenClaims.TokenType,
	}

	refreshToken, err := middleware.GenerateTokenFromClaims(&refreshTokenClaimsMap)
	if err != nil {
		return "", "", err
	}

    if err := config.DB.Create(&models.UserSession{
		UserID:       userID,
		RefreshToken: refreshToken,
	}).Error; err != nil {
        return "", "", err
    }

    return accessToken, refreshToken, nil
}

func UpdateUserSession(ttl int, userID int, userRole models.Role) (string, string, error) {
	accessTokenDuration := time.Duration(func(ttl int) int {
		if ttl == 0 {
			return 15 * 60
		}
		return max(ttl, 1)
	}(ttl)) * time.Second

	accessTokenClaims := models.AccessTokenClaims{
		Exp:       time.Now().Add(accessTokenDuration).Unix(),
		Sub:       userID,
		Role:      userRole,
		TokenType: "access_token",
	}	

	refreshTokenClaims := models.RefreshTokenClaims{
		Exp:       time.Now().Add(time.Hour * 24 * 30).Unix(),
		Sub:       userID,
		Role:      userRole,
		TokenType: "refresh_token",
	}

	accessTokenClaimsMap := jwt.MapClaims{
		"exp":        accessTokenClaims.Exp,
		"sub":        accessTokenClaims.Sub,
		"role":       accessTokenClaims.Role,
		"token_type": accessTokenClaims.TokenType,
	}

	accessToken, err := middleware.GenerateTokenFromClaims(&accessTokenClaimsMap)
	if err != nil {
		return "", "", err
	}

	refreshTokenClaimsMap := jwt.MapClaims{
		"exp":        refreshTokenClaims.Exp,
		"sub":        refreshTokenClaims.Sub,
		"role":       refreshTokenClaims.Role,
		"token_type": refreshTokenClaims.TokenType,
	}

	refreshToken, err := middleware.GenerateTokenFromClaims(&refreshTokenClaimsMap)
	if err != nil {
		return "", "", err
	}

    if err := config.DB.Model(&models.UserSession{}).Where("user_id = ?", userID).Update("refresh_token", refreshToken).Error; err != nil {
        return "", "", err
    }

    return accessToken, refreshToken, nil
}

func Login(c *gin.Context) {
	var input LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := config.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	if !user.Activated {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Account has not been activated"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.HashPassword), []byte(input.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	accessToken, refreshToken, err := CreateUserSession(0, user.ID, user.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user session"})
		return
	}

	c.SetCookie(
		COOKIE_NAME,
		string(refreshToken),
		3600*24, // 1 day
		"/",
		"",
		true,
		true,
	)

	c.JSON(http.StatusOK, gin.H{
		"access_token": accessToken,
		"role":         user.Role,
	})
}

func Register(c *gin.Context) {
	var input RegisterInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	fmt.Println(input.Password)
	fmt.Println(input.Email)

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	role := models.RoleStudent
	if input.Role == "Coach" {
		role = models.RoleCoach
	}
	
	user := models.User{
		Email:        input.Email,
		HashPassword: string(hashedPassword),
		Activated:    false,
		Role:         role,
	}

	if err := config.DB.Where("email = ?", user.Email).FirstOrCreate(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create or find user"})
		return
	}

	registrationClaims := models.RegistrationClaims{
		Exp:       time.Now().AddDate(0, 0, 30).Unix(),
		Sub:       user.ID,
		TokenType: "activation_token",
	}
	claims := jwt.MapClaims{
		"exp":        registrationClaims.Exp,
		"sub":        registrationClaims.Sub,
		"token_type": registrationClaims.TokenType,
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	activationToken, err := token.SignedString([]byte(os.Getenv("SECRET_KEY")))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate activation token"})
		return
	}
	activationLink := fmt.Sprintf("http://localhost:3000/activate?token=%s", activationToken)

	if err := middleware.SendEmail(user.Email, "Verify Your Email Address", activationLink); err != nil {
		fmt.Println("error sending email", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send activation email"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User registered successfully. Please check your email for activation."})
}

func Logout(c *gin.Context) {
    // Get user info from the access token (set by AuthMiddleware)
    claims, exists := c.Get("user")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
        return
    }
    userClaims := claims.(*models.AccessTokenClaims)

    // Delete the session using both user ID and refresh token
    if err := config.DB.Where("user_id = ?",userClaims.Sub).Delete(&models.UserSession{}).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to logout"})
        return
    }

    c.SetCookie(COOKIE_NAME, "", -1, "/", "", true, true)
    c.JSON(http.StatusOK, gin.H{"message": "Successfully logged out"})
}

func RefreshAccessToken(c *gin.Context) {
	refreshToken, err := c.Cookie(COOKIE_NAME)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Refresh token is required"})
		return
	}

	claims := &models.RefreshTokenClaims{}
	token, err := jwt.ParseWithClaims(refreshToken, claims, func(token *jwt.Token) (interface{}, error) {
		return middleware.JWTKEY, nil
	})

	if err != nil || !token.Valid {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid refresh token"})
		return
	}

	if claims.TokenType != "refresh_token" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token type"})
		return
	}

	var userSession models.UserSession
	if err := config.DB.Where("refresh_token = ?", refreshToken).First(&userSession).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid refresh token"})
		return
	}

	accessToken, newRefreshToken, err := UpdateUserSession(0, userSession.UserID, claims.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user session"})
		return
	}

	c.SetCookie(COOKIE_NAME, string(newRefreshToken), 30*24*60*60, "/", "", false, true)
	c.JSON(http.StatusOK, gin.H{"access_token": accessToken})
}

func Activate(c *gin.Context) {
	var input ActivationInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	token, err := jwt.ParseWithClaims(input.ActivationToken, &jwt.MapClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(os.Getenv("SECRET_KEY")), nil
	})

	if err != nil || !token.Valid {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
		return
	}

	claims, ok := token.Claims.(*jwt.MapClaims)
	if !ok || (*claims)["token_type"] != "activation_token" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
		return
	}

	var user models.User
	if err := config.DB.First(&user, (*claims)["sub"]).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid token"})
		return
	}

	if user.Activated {
		c.JSON(http.StatusOK, gin.H{"message": "Already activated!"})
		return
	}

	user.Activated = true
	if err := config.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not activate user"})
		return
	}

	if err := middleware.SendActivationEmail(user.Email, "Account Activated"); err != nil {
		fmt.Println("Error sending activation email:", err)
	}

	c.JSON(http.StatusOK, gin.H{"message": "Account activated successfully"})
}

func ForgotPassword(c *gin.Context) {
	var input ForgotInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// TODO: Implement forgot password logic
	c.JSON(http.StatusOK, gin.H{"message": "If an account with that email exists, a password reset link has been sent."})
}

func ChangePassword(c *gin.Context) {
	var input ChangeInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID := c.MustGet("user_id").(int)
	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not find user"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.HashPassword), []byte(input.OldPassword)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	user.HashPassword = string(hashedPassword)
	if err := config.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not update password"})
		return
	}

	// TODO: Send password changed email
	c.JSON(http.StatusOK, gin.H{"message": "Password changed successfully"})
}

func ResetPassword(c *gin.Context) {
	var input ResetInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// TODO: Implement reset password logic
	c.JSON(http.StatusOK, gin.H{"message": "Password reset successfully"})
}