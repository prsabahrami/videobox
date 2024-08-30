package config

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	"github.com/prsabahrami/videobox/api/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

// ConnectDB initializes the connection to the Cloud SQL PostgreSQL instance
func ConnectDB() {
    db, err := connectTCPSocket()
    if err != nil {
        log.Fatalf("failed to connect to the database: %v", err)
    }

    gormDB, err := gorm.Open(postgres.New(postgres.Config{
        Conn: db,
    }), &gorm.Config{})
    if err != nil {
        log.Fatalf("failed to initialize GORM: %v", err)
    }

    DB = gormDB
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

// connectTCPSocket initializes a TCP connection pool for a Cloud SQL
// instance of Postgres.
func connectTCPSocket() (*sql.DB, error) {
    mustGetenv := func(k string) string {
        v := os.Getenv(k)
        if v == "" {
            log.Fatalf("fatal error in config.go: %s environment variable not set", k)
        }
        return v
    }

    var (
        dbUser    = mustGetenv("DB_USER")       // e.g. 'my-db-user'
        dbPwd     = mustGetenv("DB_PASS")       // e.g. 'my-db-password'
        dbTCPHost = mustGetenv("INSTANCE_HOST") // e.g. '127.0.0.1' ('172.17.0.1' if deployed to GAE Flex)
        dbPort    = mustGetenv("DB_PORT")       // e.g. '5432'
        dbName    = mustGetenv("DB_NAME")       // e.g. 'my-database'
    )

    dbURI := fmt.Sprintf("host=%s user=%s password=%s port=%s database=%s",
        dbTCPHost, dbUser, dbPwd, dbPort, dbName)

    // dbPool is the pool of database connections.
    dbPool, err := sql.Open("pgx", dbURI)
    if err != nil {
        return nil, fmt.Errorf("sql.Open: %w", err)
    }

    return dbPool, nil
}
