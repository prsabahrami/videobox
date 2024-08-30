package models

import "time"

type Video struct {
    ID          uint      `gorm:"primaryKey"`
    MuxAssetID  string
    Duration    int
    UserID      uint
    FileName    string
    PlaybackID  string
    CourseID    uint
    CreatedAt   time.Time
    User        User      `gorm:"foreignKey:UserID"`
}
