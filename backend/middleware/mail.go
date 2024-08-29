package middleware

import (
	"bytes"
	"fmt"
	"net/smtp"
	"os"
	"html/template"
)

func SendEmail(to, subject, verificationLink string) error {
	from := os.Getenv("EMAIL_ADDRESS")
	password := os.Getenv("EMAIL_PASSWORD")
	host := os.Getenv("SMTP_HOST")
	port := os.Getenv("SMTP_PORT")

	if from == "" || password == "" || host == "" || port == "" {
		return fmt.Errorf("email credentials not set")
	}

	htmlBody := generateVerificationEmailHTML(verificationLink)

	msg := "From: " + from + "\n" +
		"To: " + to + "\n" +
		"Subject: " + subject + "\n" +
		"MIME-Version: 1.0\n" +
		"Content-Type: text/html; charset=UTF-8\n\n" +
		htmlBody

	auth := smtp.PlainAuth("", from, password, host)
	err := smtp.SendMail(fmt.Sprintf("%s:%s", host, port), auth, from, []string{to}, []byte(msg))
	if err != nil {
		return fmt.Errorf("failed to send email: %w", err)
	}

	return nil
}

func generateVerificationEmailHTML(verificationLink string) string {
	htmlTemplate := `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .button { display: inline-block; padding: 10px 20px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Verify Your Email Address</h1>
        <p>Thank you for signing up! Please click the button below to verify your email address:</p>
        <p><a href="{{.VerificationLink}}" class="button">Verify Email</a></p>
        <p>If the button doesn't work, you can copy and paste the following link into your browser:</p>
        <p>{{.VerificationLink}}</p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
    </div>
</body>
</html>
`

	tmpl, err := template.New("verificationEmail").Parse(htmlTemplate)
	if err != nil {
		return "Error generating email template"
	}

	data := struct {
		VerificationLink string
	}{
		VerificationLink: verificationLink,
	}

	var buf bytes.Buffer
	if err := tmpl.Execute(&buf, data); err != nil {
		return "Error executing email template"
	}

	return buf.String()
}

func SendActivationEmail(to, subject string) error {
	from := os.Getenv("EMAIL_ADDRESS")
	password := os.Getenv("EMAIL_PASSWORD")
	host := os.Getenv("SMTP_HOST")
	port := os.Getenv("SMTP_PORT")

	if from == "" || password == "" || host == "" || port == "" {
		return fmt.Errorf("SMTP configuration is incomplete")
	}

	htmlTemplate := `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Activated</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .button { display: inline-block; padding: 10px 20px; background-color: #28a745; color: #ffffff; text-decoration: none; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Email Successfully Activated</h1>
        <p>Congratulations! Your email address has been successfully activated.</p>
        <p>You can now enjoy all the features of our service.</p>
        <p>If you have any questions or need further assistance, feel free to contact our support team.</p>
        <p>Thank you for being with us!</p>
    </div>
</body>
</html>
`

	tmpl, err := template.New("activationEmail").Parse(htmlTemplate)
	if err != nil {
		return fmt.Errorf("error generating email template")
	}

	var buf bytes.Buffer
	if err := tmpl.Execute(&buf, nil); err != nil {
		return fmt.Errorf("error executing email template")
	}

	msg := "From: " + from + "\n" +
		"To: " + to + "\n" +
		"Subject: " + subject + "\n" +
		"MIME-version: 1.0;\nContent-Type: text/html; charset=\"UTF-8\";\n\n" +
		buf.String()

	auth := smtp.PlainAuth("", from, password, host)
	err = smtp.SendMail(fmt.Sprintf("%s:%s", host, port), auth, from, []string{to}, []byte(msg))
	if err != nil {
		return fmt.Errorf("failed to send email: %w", err)
	}

	return nil
}

func SendVideoSharedEmail(to, coachEmail, courseName, shareToken string) error {
	from := os.Getenv("EMAIL_ADDRESS")
	password := os.Getenv("EMAIL_PASSWORD")
	host := os.Getenv("SMTP_HOST")
	port := os.Getenv("SMTP_PORT")

	if from == "" || password == "" || host == "" || port == "" {
		return fmt.Errorf("email credentials not set")
	}

	htmlBody := generateVideoSharedEmailHTML(coachEmail, courseName, shareToken)

	subject := "A Video Has Been Shared With You"

	msg := "From: " + from + "\n" +
		"To: " + to + "\n" +
		"Subject: " + subject + "\n" +
		"MIME-Version: 1.0\n" +
		"Content-Type: text/html; charset=UTF-8\n\n" +
		htmlBody

	auth := smtp.PlainAuth("", from, password, host)
	err := smtp.SendMail(fmt.Sprintf("%s:%s", host, port), auth, from, []string{to}, []byte(msg))
	if err != nil {
		return fmt.Errorf("failed to send email: %w", err)
	}

	return nil
}

func generateVideoSharedEmailHTML(coachEmail, courseName, shareToken string) string {
	htmlTemplate := `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Video Shared With You</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .button { display: inline-block; padding: 10px 20px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>A Video Has Been Shared With You</h1>
        <p>Hello,</p>
        <p>A coach has shared a class video with you. Here are the details:</p>
        <ul>
            <li>Coach's Email: {{.CoachEmail}}</li>
            <li>Course Name: {{.CourseName}}</li>
        </ul>
        <p>To view the video, please click the button below:</p>
        <p><a href="http://localhost:3000/view/{{.ShareToken}}" class="button">View Shared Video</a></p>
        <p>If the button doesn't work, you can copy and paste the following link into your browser:</p>
        <p>http://localhost:3000/view/{{.ShareToken}}</p>
        <p>If you have any questions, please contact the coach directly.</p>
        <p>Thank you for using our service!</p>
    </div>
</body>
</html>
`

	tmpl, err := template.New("videoSharedEmail").Parse(htmlTemplate)
	if err != nil {
		return "Error generating email template"
	}

	data := struct {
		CoachEmail string
		CourseName string
		ShareToken string
	}{
		CoachEmail: coachEmail,
		CourseName: courseName,
		ShareToken: shareToken,
	}

	var buf bytes.Buffer
	if err := tmpl.Execute(&buf, data); err != nil {
		return "Error executing email template"
	}

	return buf.String()
}
