package models
import "time"

type Course struct {
    ID          uint      `gorm:"primaryKey"`
    Name        string    `gorm:"not null"`
    Description string    `gorm:"not null"`
	UserID      uint
	CreatedAt   time.Time
	User        User      `gorm:"foreignKey:UserID"`
}