package models

import (
	"github.com/golang-jwt/jwt/v5"
	"time"
)

type Role string

const (
	RoleStudent Role = "Student"
	RoleCoach Role = "Coach"
	AnyRole   Role = "Any"
)

type User struct {
	ID           int    `gorm:"primaryKey"`
	Email        string `gorm:"unique"`
	HashPassword string
	Activated    bool
	CreatedAt    time.Time
	UpdatedAt    time.Time
	Role         Role `gorm:"type:text"`
}

type UserSession struct {
	ID           int `gorm:"primaryKey"`
	UserID       int
	RefreshToken string
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

type RegistrationClaims struct {
	jwt.RegisteredClaims
	Exp       int64  `json:"exp"`
	Sub       int    `json:"sub"`
	Role      Role   `json:"role"`
	TokenType string `json:"token_type"`
}

type RefreshTokenClaims struct {
	jwt.RegisteredClaims
	Exp       int64  `json:"exp"`
	Sub       int    `json:"sub"`
	Role      Role   `json:"role"`
	TokenType string `json:"token_type"`
}

type AccessTokenClaims struct {
	jwt.RegisteredClaims
	Exp       int64  `json:"exp"`
	Sub       int    `json:"sub"`
	Role      Role   `json:"role"`
	TokenType string `json:"token_type"`
}