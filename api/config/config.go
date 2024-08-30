package config

import (
	"log"
	"os"

	"github.com/prsabahrami/videobox/api/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

// ConnectDB initializes the connection to the PostgreSQL database
func ConnectDB() {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL environment variable not set")
	}

	var err error
	DB, err = gorm.Open(postgres.Open(dbURL), &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect to the database: %v", err)
	}

	log.Println("database connected successfully")

	// Run auto-migration
	err = AutoMigrate()
	if err != nil {
		log.Fatalf("failed to run auto-migration: %v", err)
	}
	log.Println("auto-migration completed successfully")
}

// AutoMigrate runs auto-migration for all models
func AutoMigrate() error {
	return DB.AutoMigrate(
		&models.User{},
		&models.UserSession{},
		&models.Video{},
		&models.VideoShare{},
		&models.Course{},
	)
}
