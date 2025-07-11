import nodemailer from "nodemailer";

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail", // You can change this to your preferred email service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD, // Use app password for Gmail
      },
    });
  }

  async sendOTP(email: string, otp: string, name?: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Email Verification OTP - Second Brain",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="margin: 0; font-size: 28px;">Second Brain</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Email Verification</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-bottom: 20px;">Hello ${name || 'there'}!</h2>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
                Thank you for registering with Second Brain. To complete your registration, 
                please use the following verification code:
              </p>
              
              <div style="background: #fff; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
                <h1 style="color: #667eea; font-size: 32px; margin: 0; letter-spacing: 5px; font-weight: bold;">${otp}</h1>
              </div>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                This code will expire in 10 minutes for security reasons.
              </p>
              
              <div style="background: #e8f4fd; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0;">
                <p style="color: #333; margin: 0; font-size: 14px;">
                  <strong>Security Tip:</strong> Never share this code with anyone. 
                  Second Brain will never ask for this code via phone or email.
                </p>
              </div>
              
              <p style="color: #999; font-size: 12px; margin-top: 30px; text-align: center;">
                If you didn't create an account with Second Brain, please ignore this email.
              </p>
            </div>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error("Error sending email:", error);
      return false;
    }
  }

  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Welcome to Second Brain! 🎉",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="margin: 0; font-size: 28px;">Welcome to Second Brain!</h1>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-bottom: 20px;">Hello ${name}! 👋</h2>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
                Congratulations! Your email has been successfully verified and your account is now active.
                You're all set to start organizing your thoughts and ideas with Second Brain.
              </p>
              
              <div style="background: #fff; border-radius: 8px; padding: 20px; margin: 25px 0; border-left: 4px solid #28a745;">
                <h3 style="color: #333; margin-top: 0;">What's Next?</h3>
                <ul style="color: #666; line-height: 1.8;">
                  <li>Complete your profile setup</li>
                  <li>Create your first workspace</li>
                  <li>Start organizing your thoughts</li>
                  <li>Explore our AI-powered features</li>
                </ul>
              </div>
              
              <p style="color: #666; line-height: 1.6;">
                If you have any questions or need help getting started, feel free to reach out to our support team.
              </p>
              
              <p style="color: #999; font-size: 12px; margin-top: 30px; text-align: center;">
                Thank you for choosing Second Brain!
              </p>
            </div>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error("Error sending welcome email:", error);
      return false;
    }
  }
}

export default new EmailService(); 