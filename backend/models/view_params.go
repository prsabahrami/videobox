package models

type ViewParams struct {
    ID int `form:"id" binding:"required"`
}
