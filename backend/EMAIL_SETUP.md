# Email Setup Guide

## Required Environment Variables

Add the following environment variables to your `.env` file:

```env
# Email Configuration (for Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

## Gmail Setup Instructions

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Navigate to Security
   - Under "2-Step Verification", click on "App passwords"
   - Generate a new app password for "Mail"
   - Use this password in your `EMAIL_PASSWORD` environment variable

## Alternative Email Services

You can modify the email service configuration in `src/services/emailService.ts` to use other email providers:

### For Outlook/Hotmail:
```typescript
this.transporter = nodemailer.createTransporter({
  service: "outlook",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});
```

### For Custom SMTP:
```typescript
this.transporter = nodemailer.createTransporter({
  host: "your-smtp-host.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});
```

## Testing Email Functionality

1. Start your server
2. Register a new user
3. Check the email inbox for the OTP
4. Verify the OTP using the `/verify-otp` endpoint

## Troubleshooting

- **Email not sending**: Check your email credentials and app password
- **OTP not received**: Check spam folder
- **Gmail blocking**: Make sure to use app password, not regular password 