export const VERIFICATION_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email - CareConnect</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f8fafc;">
  <!-- Header -->
  <div style="background: linear-gradient(135deg, #00B4A6 0%, #0891B2 100%); padding: 30px 20px; text-align: center;">
    <div style="display: inline-flex; align-items: center; margin-bottom: 10px;">
      <div style="width: 40px; height: 40px; background-color: rgba(255,255,255,0.2); border-radius: 8px; margin-right: 12px; display: inline-flex; align-items: center; justify-content: center;">
        <span style="color: white; font-size: 24px;">🏥</span>
      </div>
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">CareConnect</h1>
    </div>
    <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 16px;">Verify Your Email Address</p>
  </div>
  
  <!-- Main Content -->
  <div style="background-color: white; padding: 40px 30px; margin: 0;">
    <h2 style="color: #1e293b; font-size: 24px; font-weight: 600; margin: 0 0 20px 0;">Welcome to CareConnect!</h2>
    
    <p style="color: #64748b; font-size: 16px; margin: 0 0 20px 0;">Thank you for joining our platform. To complete your registration and start connecting with healthcare professionals, please verify your email address.</p>
    
    <p style="color: #64748b; font-size: 16px; margin: 0 0 30px 0;">Your verification code is:</p>
    
    <!-- Verification Code -->
    <div style="text-align: center; margin: 40px 0;">
      <div style="background: linear-gradient(135deg, #f0fdfa 0%, #e6fffa 100%); border: 2px solid #00B4A6; border-radius: 12px; padding: 20px; display: inline-block;">
        <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #00B4A6; font-family: 'Courier New', monospace;">{verificationCode}</span>
      </div>
    </div>
    
    <p style="color: #64748b; font-size: 16px; margin: 0 0 20px 0;">Enter this code on the verification page to complete your registration and start booking appointments with top-rated professionals.</p>
    
    <!-- Important Note -->
    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 30px 0; border-radius: 0 8px 8px 0;">
      <p style="color: #92400e; font-size: 14px; margin: 0; font-weight: 500;">⚠️ This code will expire in 15 minutes for security reasons.</p>
    </div>
    
    <p style="color: #64748b; font-size: 14px; margin: 30px 0 0 0;">If you didn't create an account with CareConnect, please ignore this email and no action is required.</p>
  </div>
  
  <!-- Footer -->
  <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
    <p style="color: #64748b; font-size: 14px; margin: 0 0 10px 0;">Best regards,<br><strong>The CareConnect Team</strong></p>
    <p style="color: #94a3b8; font-size: 12px; margin: 0;">This is an automated message. Please do not reply to this email.</p>
  </div>
</body>
</html>
`;

export const WELCOME_EMAIL = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to CareConnect</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f8fafc;">
  <!-- Header -->
  <div style="background: linear-gradient(135deg, #00B4A6 0%, #0891B2 100%); padding: 30px 20px; text-align: center;">
    <div style="display: inline-flex; align-items: center; margin-bottom: 10px;">
      <div style="width: 40px; height: 40px; background-color: rgba(255,255,255,0.2); border-radius: 8px; margin-right: 12px; display: inline-flex; align-items: center; justify-content: center;">
        <span style="color: white; font-size: 24px;">🏥</span>
      </div>
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">CareConnect</h1>
    </div>
    <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 16px;">Welcome to Our Platform</p>
  </div>
  
  <!-- Main Content -->
  <div style="background-color: white; padding: 40px 30px; margin: 0;">
    <h2 style="color: #1e293b; font-size: 24px; font-weight: 600; margin: 0 0 20px 0;">🎉 Welcome to CareConnect!</h2>
    
    <p style="color: #64748b; font-size: 16px; margin: 0 0 20px 0;">Thank you for joining our healthcare platform! You're now part of a community that connects patients with top-rated professionals.</p>
    
    <!-- Features Section -->
    <div style="background: linear-gradient(135deg, #f0fdfa 0%, #e6fffa 100%); border-radius: 12px; padding: 25px; margin: 30px 0;">
      <h3 style="color: #00B4A6; font-size: 18px; font-weight: 600; margin: 0 0 15px 0;">What you can do now:</h3>
      <ul style="color: #64748b; font-size: 15px; margin: 0; padding-left: 20px;">
        <li style="margin-bottom: 8px;">Browse healthcare professionals by specialty</li>
        <li style="margin-bottom: 8px;">Book appointments with top-rated professionals</li>
        <li style="margin-bottom: 8px;">Manage your healthcare needs in one place</li>
        <li style="margin-bottom: 0;">Access your profile and appointment history</li>
      </ul>
    </div>
    
    <!-- CTA Button -->
    <div style="text-align: center; margin: 35px 0;">
      <a href="#" style="background: linear-gradient(135deg, #00B4A6 0%, #0891B2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(0, 180, 166, 0.1);">Start Exploring</a>
    </div>
    
    <p style="color: #64748b; font-size: 16px; margin: 30px 0 0 0;">We're excited to have you on board and look forward to helping you connect with the right professionals for your needs.</p>
  </div>
  
  <!-- Footer -->
  <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
    <p style="color: #64748b; font-size: 14px; margin: 0 0 10px 0;">Best regards,<br><strong>The CareConnect Team</strong></p>
    <p style="color: #94a3b8; font-size: 12px; margin: 0;">This is an automated message. Please do not reply to this email.</p>
  </div>
</body>
</html>
`;

export const PASSWORD_RESET_SUCCESS_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Successful - CareConnect</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f8fafc;">
  <!-- Header -->
  <div style="background: linear-gradient(135deg, #00B4A6 0%, #0891B2 100%); padding: 30px 20px; text-align: center;">
    <div style="display: inline-flex; align-items: center; margin-bottom: 10px;">
      <div style="width: 40px; height: 40px; background-color: rgba(255,255,255,0.2); border-radius: 8px; margin-right: 12px; display: inline-flex; align-items: center; justify-content: center;">
        <span style="color: white; font-size: 24px;">🏥</span>
      </div>
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">CareConnect</h1>
    </div>
    <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 16px;">Password Reset Successful</p>
  </div>
  
  <!-- Main Content -->
  <div style="background-color: white; padding: 40px 30px; margin: 0;">
    <!-- Success Icon -->
    <div style="text-align: center; margin: 0 0 30px 0;">
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; width: 80px; height: 80px; line-height: 80px; border-radius: 50%; display: inline-block; font-size: 40px; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.1);">
        ✓
      </div>
    </div>
    
    <h2 style="color: #1e293b; font-size: 24px; font-weight: 600; margin: 0 0 20px 0; text-align: center;">Password Successfully Reset</h2>
    
    <p style="color: #64748b; font-size: 16px; margin: 0 0 20px 0;">Your CareConnect account password has been successfully updated. You can now log in with your new password and continue managing your healthcare needs.</p>
    
    <!-- Security Alert -->
    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
      <h3 style="color: #92400e; font-size: 16px; margin: 0 0 10px 0; font-weight: 600;">🔒 Security Notice</h3>
      <p style="color: #92400e; font-size: 14px; margin: 0;">If you did not initiate this password reset, please contact our support team immediately.</p>
    </div>
    
    <!-- Security Recommendations -->
    <div style="background: linear-gradient(135deg, #f0fdfa 0%, #e6fffa 100%); border-radius: 12px; padding: 25px; margin: 30px 0;">
      <h3 style="color: #00B4A6; font-size: 18px; font-weight: 600; margin: 0 0 15px 0;">Security Recommendations</h3>
      <ul style="color: #64748b; font-size: 15px; margin: 0; padding-left: 20px;">
        <li style="margin-bottom: 8px;">Use a strong, unique password for your CareConnect account</li>
        <li style="margin-bottom: 8px;">Enable two-factor authentication if available</li>
        <li style="margin-bottom: 8px;">Avoid using the same password across multiple sites</li>
        <li style="margin-bottom: 0;">Log out of shared or public devices after use</li>
      </ul>
    </div>
    
    <!-- CTA Button -->
    <div style="text-align: center; margin: 35px 0;">
      <a href="#" style="background: linear-gradient(135deg, #00B4A6 0%, #0891B2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(0, 180, 166, 0.1);">Access Your Account</a>
    </div>
    
    <p style="color: #64748b; font-size: 14px; margin: 30px 0 0 0; text-align: center;">Thank you for helping us keep your healthcare information secure.</p>
  </div>
  
  <!-- Footer -->
  <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
    <p style="color: #64748b; font-size: 14px; margin: 0 0 10px 0;">Best regards,<br><strong>The CareConnect Team</strong></p>
    <p style="color: #94a3b8; font-size: 12px; margin: 0;">This is an automated message. Please do not reply to this email.</p>
  </div>
</body>
</html>
`;

export const PASSWORD_RESET_REQUEST_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password - CareConnect</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f8fafc;">
  <!-- Header -->
  <div style="background: linear-gradient(135deg, #00B4A6 0%, #0891B2 100%); padding: 30px 20px; text-align: center;">
    <div style="display: inline-flex; align-items: center; margin-bottom: 10px;">
      <div style="width: 40px; height: 40px; background-color: rgba(255,255,255,0.2); border-radius: 8px; margin-right: 12px; display: inline-flex; align-items: center; justify-content: center;">
        <span style="color: white; font-size: 24px;">🏥</span>
      </div>
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">CareConnect</h1>
    </div>
    <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 16px;">Password Reset Request</p>
  </div>
  
  <!-- Main Content -->
  <div style="background-color: white; padding: 40px 30px; margin: 0;">
    <!-- Lock Icon -->
    <div style="text-align: center; margin: 0 0 30px 0;">
      <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; width: 80px; height: 80px; line-height: 80px; border-radius: 50%; display: inline-block; font-size: 40px; box-shadow: 0 4px 6px rgba(249, 115, 22, 0.1);">
        🔒
      </div>
    </div>
    
    <h2 style="color: #1e293b; font-size: 24px; font-weight: 600; margin: 0 0 20px 0; text-align: center;">Reset Your Password</h2>
    
    <p style="color: #64748b; font-size: 16px; margin: 0 0 20px 0;">We received a request to reset the password for your CareConnect account. If you didn't make this request, please ignore this email and your password will remain unchanged.</p>
    
    <p style="color: #64748b; font-size: 16px; margin: 0 0 30px 0;">To reset your password and regain access to your account, click the button below:</p>
    
    <!-- Reset Button -->
    <div style="text-align: center; margin: 40px 0;">
      <a href="{resetURL}" style="background: linear-gradient(135deg, #00B4A6 0%, #0891B2 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(0, 180, 166, 0.1);">Reset My Password</a>
    </div>
    
    <!-- Alternative Link -->
    <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 30px 0;">
      <p style="color: #64748b; font-size: 14px; margin: 0 0 10px 0; font-weight: 500;">If the button doesn't work, copy and paste this link:</p>
      <p style="color: #00B4A6; font-size: 14px; margin: 0; word-break: break-all; font-family: 'Courier New', monospace;">{resetURL}</p>
    </div>
    
    <!-- Important Note -->
    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 30px 0; border-radius: 0 8px 8px 0;">
      <p style="color: #92400e; font-size: 14px; margin: 0; font-weight: 500;">⚠️ This link will expire in 1 hour for security reasons.</p>
    </div>
    
    <p style="color: #64748b; font-size: 14px; margin: 30px 0 0 0;">If you continue to have trouble accessing your account, please contact our support team for assistance.</p>
  </div>
  
  <!-- Footer -->
  <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
    <p style="color: #64748b; font-size: 14px; margin: 0 0 10px 0;">Best regards,<br><strong>The CareConnect Team</strong></p>
    <p style="color: #94a3b8; font-size: 12px; margin: 0;">This is an automated message. Please do not reply to this email.</p>
  </div>
</body>
</html>
`;
