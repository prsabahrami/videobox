package utils

import (
	"errors"
	"fmt"
	"os"
	"time"

	muxgo "github.com/muxinc/mux-go"
)

var (
	muxClient *muxgo.APIClient
)

func InitMux() error {
	muxClient = muxgo.NewAPIClient(
		muxgo.NewConfiguration(
			muxgo.WithBasicAuth(os.Getenv("MUX_TOKEN_ID"), os.Getenv("MUX_TOKEN_SECRET")),
	))
	return nil
}

func UploadVideo(videoPath string) (int, string, string, error) {
	asset, err := muxClient.AssetsApi.CreateAsset(muxgo.CreateAssetRequest{
        Input: []muxgo.InputSettings{
            muxgo.InputSettings{
                Url: videoPath,
            },
        },
        PlaybackPolicy: []muxgo.PlaybackPolicy{"PUBLIC"},
    })

	if err != nil {
		return 0, "", "", err
	}

	playbackId := asset.Data.PlaybackIds[0].Id
	for {
        asset, err := muxClient.AssetsApi.GetAsset(asset.Data.Id)
        if err != nil {
            return 0, "", "", err
        }

        if asset.Data.Status == "ready" {
            break
        }

        if asset.Data.Status == "errored" {
            return 0, "", "", errors.New("asset processing failed")
        }

        // Wait for a second before checking again
        time.Sleep(1 * time.Second)
    }
	asset, err = muxClient.AssetsApi.GetAsset(asset.Data.Id)
	if err != nil {
		return 0, "", "", err
	}
	fmt.Println("Asset data", asset.Data)
	return int(asset.Data.Duration), asset.Data.Id, playbackId, nil
}

func DeleteVideo(assetId string) error {
	fmt.Println("Deleting video from Mux", assetId)
	err := muxClient.AssetsApi.DeleteAsset(assetId)
	if err != nil {
		fmt.Println("Error deleting video from Mux", err)
		return err
	}
	return nil
}