package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/prsabahrami/videobox/backend/controllers"
	"github.com/prsabahrami/videobox/backend/middleware"
	"github.com/prsabahrami/videobox/backend/models"
)

func SetupRouter() *gin.Engine {
    r := gin.Default()

    // Set trusted proxies
    r.SetTrustedProxies([]string{"127.0.0.1"})

    // API group
    api := r.Group("/api")
    {
        auth := api.Group("/auth")
        {
            auth.POST("/register", controllers.Register)
            auth.POST("/login", controllers.Login)
            auth.POST("/activate", controllers.Activate)
            auth.POST("/logout", middleware.AuthMiddleware(models.AnyRole), controllers.Logout)
            auth.POST("/refresh", controllers.RefreshAccessToken)
        }

        // Other API routes
        api.GET("/pg", middleware.AuthMiddleware(models.RoleCoach), controllers.Index)
        api.DELETE("/delete/:id", middleware.AuthMiddleware(models.RoleCoach), controllers.Delete)
		api.POST("/create", middleware.AuthMiddleware(models.RoleCoach), controllers.Create)
        api.POST("/transcode", middleware.AuthMiddleware(models.RoleCoach), controllers.Transcode)
        api.POST("/share", middleware.AuthMiddleware(models.RoleCoach), controllers.ShareVideo)
		api.GET("/view/:token", middleware.AuthMiddleware(models.RoleStudent), controllers.GetSharedVideo)
		api.GET("/courses", middleware.AuthMiddleware(models.RoleCoach), controllers.GetCourses)
		api.POST("/courses", middleware.AuthMiddleware(models.RoleCoach), controllers.CreateCourse)
    }


    return r
}
