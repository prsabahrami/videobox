package models

import "time"

type Video struct {
    ID          uint      `gorm:"primaryKey"`
    UserID      uint
    FileName    string
    CourseID    uint
    CreatedAt   time.Time
    User        User      `gorm:"foreignKey:UserID"`
}
