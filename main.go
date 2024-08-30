package main

import (
	// "log"
	"os"
	"os/exec"
	"fmt"

	// "github.com/joho/godotenv"
	"github.com/prsabahrami/videobox/api/config"
	"github.com/prsabahrami/videobox/api/routes"
	"github.com/prsabahrami/videobox/api/utils"
)

func main() {
    // Load .env file
    // err := godotenv.Load()
    // if err != nil {
    //     log.Fatalf("Error loading .env file: %v", err)
	// }
    config.ConnectDB()
	utils.InitStorage()
	utils.InitMux()
    r := routes.SetupRouter()
    r.Run(":8000")
}
