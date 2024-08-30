package middleware

import (
	"errors"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/prsabahrami/videobox/api/models"
)

var SECRET_KEY = os.Getenv("SECRET_KEY")
var JWTKEY = []byte(SECRET_KEY)

func GenerateToken(user *models.User) (string, error) {
    expirationTime := time.Now().Add(24 * time.Hour)
    
    claims := jwt.MapClaims{
        "sub":  user.Email,
        "exp":  expirationTime.Unix(),
        "role": user.Role,
    }

    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString(JWTKEY)
}

func GenerateTokenFromClaims(claims *jwt.MapClaims) (string, error) {
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString(JWTKEY)
}

func AuthMiddleware(role models.Role) gin.HandlerFunc {
    return func(c *gin.Context) {
		fmt.Println("AuthMiddleware")
        authHeader := c.GetHeader("Authorization")
        if authHeader == "" {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header is required"})
            c.Abort()
            return
        }

        bearerToken := strings.Split(authHeader, " ")
        if len(bearerToken) != 2 || bearerToken[0] != "Bearer" {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token format"})
            c.Abort()
            return
        }

        tokenString := bearerToken[1]
        claims := &models.AccessTokenClaims{}

        // Parse the token
        token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
            // Verify the signing method
            if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
                return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
            }
            return JWTKEY, nil
        })

        if err != nil {
            if errors.Is(err, jwt.ErrTokenExpired) {
                c.JSON(http.StatusUnauthorized, gin.H{"error": "Token has expired"})
            } else if errors.Is(err, jwt.ErrSignatureInvalid) {
                c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token signature"})
            } else {
                c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid token"})
            }
            c.Abort()
            return
        }

        if !token.Valid {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
            c.Abort()
            return
        }

        // Check if the token type is "access_token"
        if claims.TokenType != "access_token" {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token type"})
            c.Abort()
            return
        }

        if claims.Role != role && role != models.AnyRole{
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
            c.Abort()
            return
        }
        // Set the user claims in the context
        c.Set("user", claims)
        c.Next()
    }
}