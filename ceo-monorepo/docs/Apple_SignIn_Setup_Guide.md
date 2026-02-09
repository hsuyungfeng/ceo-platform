# Apple Sign-In Setup Guide

## Overview
This guide provides step-by-step instructions for setting up Apple Sign-In authentication for both web and mobile platforms in the CEO B2B e-commerce platform.

## Web Configuration

### 1. Create Apple Developer Account
- Visit [Apple Developer Portal](https://developer.apple.com)
- Sign in with your Apple ID
- Enroll in the Apple Developer Program (if not already enrolled)

### 2. Register Service ID in Apple Developer Portal
1. Go to **Certificates, Identifiers & Profiles**
2. Select **Identifiers** → **+** to create new identifier
3. Choose **Services IDs** and click **Continue**
4. Enter description: `CEO B2B Platform Service`
5. Enter identifier: `com.example.ceo-platform.service` (use your actual bundle ID)
6. Enable **Sign In with Apple** capability
7. Click **Continue** → **Register**

### 3. Generate Private Key for Service ID
1. Select your Service ID from the list
2. Click **Configure** next to Sign In with Apple
3. Click **Create Primary App ID** (if not already created)
4. Go to **Keys** → **+** to create new key
5. Enter key name: `CEO B2B Platform Sign In Key`
6. Enable **Sign In with Apple**
7. Click **Configure** and select your Primary App ID
8. Click **Save** → **Continue** → **Register**
9. Download the private key (.p8 file) and save it securely

### 4. Configure Redirect URI
1. In Service ID configuration, add redirect URI:
   ```
   http://localhost:3000/api/auth/callback/apple
   ```
2. For production, add your production domain:
   ```
   https://your-domain.com/api/auth/callback/apple
   ```

### 5. Add Environment Variables to `.env.local`
Copy the values from `.env.local.example` and replace with your actual values:

```bash
# Apple OAuth (for B2B platform)
APPLE_CLIENT_ID=com.example.ceo-platform.service  # Your Service ID
APPLE_CLIENT_SECRET=-----BEGIN PRIVATE KEY-----\nMIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...\n-----END PRIVATE KEY-----  # Your private key
APPLE_TEAM_ID=XXXXXXXXXX  # Your Team ID from Apple Developer Portal
APPLE_KEY_ID=XXXXXXXXXX   # Your Key ID from generated private key
```

**Note:** The private key should be formatted as a single line with `\n` replacing actual newlines.

## Mobile Configuration

### 1. Enable Sign In with Apple Capability in Xcode
1. Open your iOS project in Xcode
2. Select your target → **Signing & Capabilities**
3. Click **+ Capability**
4. Search for **Sign In with Apple** and add it

### 2. Configure App ID with Sign In with Apple Enabled
1. In Apple Developer Portal, go to **Certificates, Identifiers & Profiles**
2. Select **Identifiers** → your App ID
3. Enable **Sign In with Apple** capability
4. Click **Save**

### 3. Add Apple Sign-In Entitlement File
The entitlement file has been created at:
- `apps/mobile/ios/Capabilities/AppleSignIn.entitlements`

### 4. Configure Environment Variables
Add to your `.env` file:

```bash
# Apple Sign-In
APPLE_SERVICE_ID=com.example.ceo-platform.service  # Same as web Service ID
```

## Testing

### Web Testing
1. Start the web application:
   ```bash
   cd apps/web && npm run dev
   ```
2. Visit `http://localhost:3000/login`
3. Click **使用 Apple 帳戶登入** button
4. You should be redirected to Apple's authentication page

### Mobile Testing
1. Build and run the iOS app:
   ```bash
   cd apps/mobile && npm run ios
   ```
2. On the login screen, tap **使用 Apple 帳戶登入**
3. You should see the native Apple Sign-In dialog

## Troubleshooting

### Common Issues

#### 1. "Invalid redirect_uri" Error
- Ensure redirect URI is correctly configured in Apple Developer Portal
- Check that the URI matches exactly (including http/https)

#### 2. "Invalid client secret" Error
- Verify private key format (should be single line with `\n`)
- Check that Team ID and Key ID are correct
- Ensure private key hasn't expired (valid for 6 months)

#### 3. Apple Sign-In Not Showing on Mobile
- Verify Sign In with Apple capability is enabled in Xcode
- Check that the entitlement file is included in build
- Ensure App ID has Sign In with Apple enabled in Developer Portal

#### 4. Email Not Received
- Apple may use privacy email relay
- Check both real email and privacy relay email
- Verify email scope is requested in authentication

## Security Notes

1. **Private Key Security:**
   - Never commit private keys to version control
   - Store keys in secure environment variables
   - Rotate keys every 6 months (Apple's maximum validity)

2. **Token Validation:**
   - Always validate identity tokens on server
   - Check token expiration and signature
   - Verify audience matches your Service ID

3. **User Data Privacy:**
   - Apple provides privacy email relay
   - Handle both real and relay emails
   - Respect user's email sharing preferences

## Production Deployment

### 1. Update Environment Variables
Replace development values with production values:
- Update `APPLE_CLIENT_ID` to production Service ID
- Update redirect URIs to production domains
- Use production private key

### 2. Update iOS Configuration
- Update App ID for production
- Configure production entitlements
- Test with production Apple ID

### 3. Monitoring and Logging
- Monitor authentication success/failure rates
- Log authentication events (without sensitive data)
- Set up alerts for authentication failures

## Support

For additional help:
- Refer to [Apple Developer Documentation](https://developer.apple.com/sign-in-with-apple/)
- Check NextAuth Apple provider documentation
- Review React Native Apple Authentication library docs
- Contact development team for platform-specific issues