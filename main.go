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

    // Install goreman CLI tool 
	// This is hacky asf :))
    cmd := exec.Command("go", "install", "github.com/prsabahrami/goreman@latest")
    if err := cmd.Run(); err != nil {
        fmt.Printf("Error installing goreman: %v\n", err)
        os.Exit(1)
    }
    config.ConnectDB()
	utils.InitStorage()
	utils.InitMux()
    r := routes.SetupRouter()
    r.Run(":8000")
}
