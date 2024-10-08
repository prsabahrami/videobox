package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/prsabahrami/videobox/api/controllers"
	"github.com/prsabahrami/videobox/api/middleware"
	"github.com/prsabahrami/videobox/api/models"
)

func SetupRouter() *gin.Engine {
    r := gin.Default()

    // Set trusted proxies
    r.SetTrustedProxies([]string{"localhost"})

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
        api.DELETE("/delete/:id", middleware.AuthMiddleware(models.RoleCoach), controllers.Delete)
		api.POST("/create", middleware.AuthMiddleware(models.RoleCoach), controllers.Create)
        api.POST("/transcode", middleware.AuthMiddleware(models.RoleCoach), controllers.Transcode)
        api.POST("/share", middleware.AuthMiddleware(models.RoleCoach), controllers.ShareVideo)
		api.GET("/view/:token", middleware.AuthMiddleware(models.RoleStudent), controllers.GetSharedVideo)
		api.GET("/courses", middleware.AuthMiddleware(models.RoleCoach), controllers.GetCourses)
		api.POST("/courses", middleware.AuthMiddleware(models.RoleCoach), controllers.CreateCourse)
        api.GET("/videos", middleware.AuthMiddleware(models.RoleCoach), controllers.Index)
    }


    return r
}
