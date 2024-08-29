package utils

import (
	"context"
	"fmt"
	"os"
	"time"

	"cloud.google.com/go/storage"
	"golang.org/x/oauth2/google"
	"golang.org/x/oauth2/jwt"
)

var (
	storageClient *storage.Client
	bucketName    string
	cfg           *jwt.Config
)

func InitStorage() error {
	var err error
	ctx := context.Background()

	// Read the service account key file
	googleSAKey, err := os.ReadFile("service-account.json")
	if err != nil {
		return fmt.Errorf("failed to read service account key file: %v", err)
	}

	// Parse the JWT config from the service account key
	cfg, err = google.JWTConfigFromJSON(googleSAKey)
	if err != nil {
		return fmt.Errorf("failed to parse JWT config: %v", err)
	}

	// Use Application Default Credentials
	storageClient, err = storage.NewClient(ctx)
	if err != nil {
		return fmt.Errorf("storage.NewClient: %v", err)
	}

	// Set the bucket name from environment variable
	bucketName = os.Getenv("GCS_BUCKET_NAME")
	if bucketName == "" {
		return fmt.Errorf("GCS_BUCKET_NAME environment variable is not set")
	}

	bucket := storageClient.Bucket(bucketName)
	bucketAttrsToUpdate := storage.BucketAttrsToUpdate{
		CORS: []storage.CORS{
			{
				MaxAge:          3600,
				Methods:         []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
				Origins:         []string{"*"},
				ResponseHeaders: []string{
					"Content-Type",
					"Access-Control-Allow-Origin",
					"x-goog-resumable",
					"Content-Length",
				},
			},
		},
	}
	if _, err := bucket.Update(ctx, bucketAttrsToUpdate); err != nil {
		return fmt.Errorf("Bucket(%q).Update: %w", bucketName, err)
	}

	return nil
}

func GenerateSignedURL(objectName string, method string) (string, error) {
	contentType := "application/octet-stream"
	url, err := storage.SignedURL(bucketName, objectName, &storage.SignedURLOptions{
		Method:         method,
		GoogleAccessID: cfg.Email,
		PrivateKey:     cfg.PrivateKey,
		Expires:        time.Now().Add(time.Second * 1000),
		ContentType:    func() string {
			if method == "POST" {
				return contentType
			}
			return ""
		}(),
		Headers: func() []string {
			if method == "POST" {
				return []string{
					"x-goog-resumable: start",
					"Content-Type: application/octet-stream",
				}
			}
			return nil
		}(),
	})
	if err != nil {
		return "", fmt.Errorf("failed to generate signed URL: %v", err)
	}

	return url, nil
}
