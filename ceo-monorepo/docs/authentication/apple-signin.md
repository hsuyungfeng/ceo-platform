# Apple Sign-In Integration

## Overview
Apple Sign-In is implemented for both web and mobile platforms in the CEO B2B e-commerce platform, providing secure authentication using Apple's OAuth 2.0 flow with privacy email relay support.

## Web Implementation

### Architecture
- Uses NextAuth Apple provider with OAuth 2.0 flow
- Supports Apple's privacy email relay system
- Server-side token validation and session management
- Database integration for user profile synchronization

### Configuration
1. **Apple Developer Setup**
   - Service ID creation with Sign In with Apple capability
   - Private key generation (valid for 6 months)
   - Redirect URI configuration

2. **Environment Variables**
   ```bash
   # Apple OAuth Configuration
   APPLE_CLIENT_ID=com.example.ceo-platform.service
   APPLE_CLIENT_SECRET=-----BEGIN PRIVATE KEY-----\nMIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...\n-----END PRIVATE KEY-----
   APPLE_TEAM_ID=XXXXXXXXXX
   APPLE_KEY_ID=XXXXXXXXXX
   ```

3. **NextAuth Configuration**
   - Apple provider integration in `apps/web/src/app/api/auth/[...nextauth]/route.ts`
   - Callback handling for token exchange
   - User profile mapping and database synchronization

### API Endpoints
- `GET /api/auth/signin?provider=apple` - Initiate Apple OAuth flow
- `POST /api/auth/callback/apple` - Apple OAuth callback handler
- `POST /api/auth/oauth/apple` - Mobile token validation endpoint

## Mobile Implementation

### Architecture
- Uses `@invertase/react-native-apple-authentication` library
- Native iOS Sign In with Apple integration
- Token exchange with backend API
- Secure token storage using Keychain

### Configuration
1. **iOS Setup**
   - Xcode capability: Sign In with Apple
   - Entitlements file: `apps/mobile/ios/Capabilities/AppleSignIn.entitlements`
   - App ID configuration in Apple Developer Portal

2. **React Native Components**
   - `AppleSignInButton` component in `apps/mobile/src/components/auth/`
   - Native button styling with Apple branding guidelines
   - Error handling and loading states

3. **Token Exchange**
   - Mobile obtains identity token from Apple
   - Token sent to backend for validation
   - Backend returns platform session tokens

### Environment Variables
```bash
# Mobile Apple Sign-In
APPLE_SERVICE_ID=com.example.ceo-platform.service
```

## Database Schema

### User Model Updates
The `User` model includes Apple Sign-In specific fields:

```prisma
model User {
  id            String   @id @default(cuid())
  email         String?  @unique
  name          String?
  taxId         String?  @unique
  password      String?
  
  // Apple Sign-In fields
  appleId       String?  @unique
  appleEmail    String?
  isAppleEmailPrivate Boolean? @default(false)
  
  // Authentication tracking
  authProvider  AuthProvider @default(CREDENTIALS)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Relations
  sessions      Session[]
  accounts      Account[]
}

enum AuthProvider {
  CREDENTIALS
  GOOGLE
  APPLE
}
```

### Account Model
```prisma
model Account {
  id                String  @id @default(cuid())
  userId            String
  provider          String  // "apple"
  providerAccountId String  // Apple user ID
  type              String  // "oauth"
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? // Apple identity token
  session_state     String?
  
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([provider, providerAccountId])
}
```

## Setup Instructions

### 1. Apple Developer Account Setup
- Create Apple Developer account
- Enroll in Apple Developer Program
- Access Certificates, Identifiers & Profiles

### 2. Service ID Creation
1. Navigate to Identifiers → Services IDs
2. Create new Service ID with description
3. Enable Sign In with Apple capability
4. Configure redirect URIs for web and mobile

### 3. Private Key Generation
1. Create new key in Keys section
2. Enable Sign In with Apple
3. Associate with Primary App ID
4. Download .p8 private key
5. Format as single line with `\n` newlines

### 4. Environment Configuration
Copy values from `.env.local.example` to `.env.local`:
- `APPLE_CLIENT_ID`: Your Service ID
- `APPLE_CLIENT_SECRET`: Formatted private key
- `APPLE_TEAM_ID`: From Apple Developer Portal
- `APPLE_KEY_ID`: From generated private key

### 5. iOS Entitlements Setup
1. Enable Sign In with Apple capability in Xcode
2. Ensure entitlement file is included in build
3. Verify App ID has capability enabled in Developer Portal

## API Endpoints

### Web Authentication
```
GET /api/auth/signin?provider=apple
```
Initiates Apple OAuth flow, redirects to Apple authentication page.

```
POST /api/auth/callback/apple
```
Handles Apple OAuth callback, validates tokens, creates session.

### Mobile Token Validation
```
POST /api/auth/oauth/apple
Content-Type: application/json

{
  "identityToken": "eyJhbGciOiJSUzI1NiIs...",
  "userIdentifier": "001234.56789abcdef...",
  "email": "user@privaterelay.appleid.com",
  "fullName": {
    "givenName": "John",
    "familyName": "Appleseed"
  }
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "email": "user@privaterelay.appleid.com",
    "name": "John Appleseed"
  },
  "session": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "def50200abc123...",
    "expiresAt": 1700000000
  }
}
```

## Testing

### Unit Tests
- Token validation logic
- User profile mapping
- Error handling scenarios

### Integration Tests
- Complete OAuth flow testing
- Database synchronization
- Session management

### End-to-End Tests
1. **Web Testing:**
   ```bash
   cd apps/web && npm run test:e2e
   ```
   - Navigate to login page
   - Click Apple Sign-In button
   - Verify successful authentication

2. **Mobile Testing:**
   ```bash
   cd apps/mobile && npm run test
   ```
   - Test AppleSignInButton component
   - Verify native authentication flow
   - Test token exchange with backend

### Test Coverage
- Authentication success/failure scenarios
- Network error handling
- Token expiration and refresh
- Privacy email relay handling

## Security Considerations

### Token Security
- Identity tokens validated server-side
- JWT signature verification
- Token expiration checks
- Audience validation (Service ID matching)

### Data Privacy
- Privacy email relay support
- User consent for email sharing
- Minimal data collection
- GDPR compliance

### Key Management
- Private keys stored in environment variables
- Regular key rotation (6-month validity)
- No keys committed to version control
- Secure key distribution for team members

## Troubleshooting

### Common Issues

#### 1. Authentication Failures
- Verify Service ID configuration
- Check redirect URI matches exactly
- Validate private key format and expiration

#### 2. Email Delivery Issues
- Check both real and privacy relay emails
- Verify email scope is requested
- Monitor Apple's email relay service

#### 3. Mobile Integration Problems
- Confirm Xcode capabilities enabled
- Verify entitlement file inclusion
- Check App ID configuration in Developer Portal

#### 4. Token Validation Errors
- Ensure correct audience (Service ID)
- Check token expiration timestamps
- Verify JWT signature with Apple's public keys

### Debugging Steps
1. Check application logs for authentication events
2. Verify environment variables are set correctly
3. Test with Apple's sandbox environment first
4. Use browser developer tools to inspect network requests
5. Check iOS device logs for native authentication errors

## Monitoring and Maintenance

### Performance Metrics
- Authentication success rate
- Average authentication time
- Error rate by failure type
- User adoption metrics

### Alerting
- Authentication failure spikes
- Token validation errors
- Service ID expiration warnings
- Key rotation reminders

### Regular Maintenance
- Rotate private keys every 6 months
- Update Apple Developer certificates annually
- Review and update redirect URIs as needed
- Monitor Apple API changes and updates

## Related Documentation

- [Apple Sign-In Setup Guide](../Apple_SignIn_Setup_Guide.md) - Step-by-step setup instructions
- [Authentication Test Report](../../AUTHENTICATION_TEST_REPORT.md) - Test results and validation
- [NextAuth Documentation](https://next-auth.js.org/providers/apple) - NextAuth Apple provider docs
- [React Native Apple Authentication](https://github.com/invertase/react-native-apple-authentication) - Library documentation

## Support and Resources

- Apple Developer Documentation: https://developer.apple.com/sign-in-with-apple/
- NextAuth Apple Provider: https://next-auth.js.org/providers/apple
- React Native Apple Authentication: https://github.com/invertase/react-native-apple-authentication
- Platform Development Team: Contact for platform-specific issues