package utils

import (
	"context"
	"fmt"
	"os"

	transcoder "cloud.google.com/go/video/transcoder/apiv1"
	"cloud.google.com/go/video/transcoder/apiv1/transcoderpb"
)


var (
	projectID string
	location string
)


func InitTranscode() error {
	projectID = os.Getenv("GCS_PROJECT_ID")
	location = os.Getenv("GCS_LOCATION")

	return nil
}
// createJobFromPreset creates a job based on a given preset template. See
// https://cloud.google.com/transcoder/docs/how-to/jobs#create_jobs_presets
// for more information.
func CreateJobFromPreset(inputURI string, outputURI string) error {
	preset := "preset/web-hd"
	// inputURI := "gs://my-bucket/my-video-file"
	// outputURI := "gs://my-bucket/my-output-folder/"

	ctx := context.Background()
	client, err := transcoder.NewClient(ctx)
	if err != nil {
			return fmt.Errorf("NewClient: %w", err)
	}
	defer client.Close()

	req := &transcoderpb.CreateJobRequest{
			Parent: fmt.Sprintf("projects/%s/locations/%s", projectID, location),
			Job: &transcoderpb.Job{
					InputUri:  inputURI,
					OutputUri: outputURI,
					JobConfig: &transcoderpb.Job_TemplateId{
							TemplateId: preset,
					},
			},
	}
	// Creates the job, Jobs take a variable amount of time to run.
	// You can query for the job state.
	response, err := client.CreateJob(ctx, req)
	if err != nil {
			return fmt.Errorf("createJobFromPreset: %w", err)
	}

	fmt.Printf("Job: %v", response.GetName())
	fmt.Printf("Job: %v", inputURI)
	fmt.Printf("Job: %v", outputURI)
	return nil
}