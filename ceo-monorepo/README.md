# CEO B2B E-commerce Platform

A modern B2B e-commerce platform built with Next.js, React Native, and TypeScript in a monorepo architecture.

## Project Structure

```
ceo-monorepo/
├── apps/
│   ├── web/              # Next.js web application
│   └── mobile/           # React Native mobile application
├── packages/             # Shared packages and libraries
├── docs/                 # Documentation
│   ├── authentication/   # Authentication documentation
│   └── plans/           # Project plans and specifications
└── tests/               # Test utilities and configurations
```

## Features

### Core Platform
- B2B e-commerce with business account management
- Product catalog with category management
- Shopping cart and order processing
- Invoice generation and order history

### Authentication
The platform supports multiple authentication methods:
- Traditional credentials (taxId + password)
- Google OAuth
- **Apple Sign-In** (web and mobile)

### Mobile App
- Native iOS and Android support
- Offline capabilities
- Push notifications
- Camera integration for document scanning

### Admin Dashboard
- User management
- Product catalog management
- Order processing and fulfillment
- Analytics and reporting

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm 8+
- iOS: Xcode 15+ (for mobile development)
- Android: Android Studio (for mobile development)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd ceo-monorepo
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   cp apps/web/.env.local.example apps/web/.env.local
   cp apps/mobile/.env.example apps/mobile/.env
   ```

4. Set up database:
   ```bash
   cd apps/web
   npx prisma db push
   npx prisma db seed
   ```

### Development

Start development servers:

```bash
# Web application
pnpm dev

# Or start specific apps
cd apps/web && pnpm dev
cd apps/mobile && pnpm start
```

### Testing

Run tests:

```bash
# All tests
pnpm test

# Web tests only
pnpm test:web

# Mobile tests only
pnpm test:mobile

# With coverage
pnpm test:coverage
```

## Authentication

### Apple Sign-In Integration

Apple Sign-In is fully implemented for both web and mobile platforms:

#### Web Implementation
- NextAuth Apple provider with OAuth 2.0 flow
- Privacy email relay support
- Server-side token validation

#### Mobile Implementation
- `@invertase/react-native-apple-authentication` library
- Native iOS Sign In with Apple
- Secure token exchange with backend

#### Documentation
- [Apple Sign-In Documentation](docs/authentication/apple-signin.md)
- [Apple Sign-In Setup Guide](docs/Apple_SignIn_Setup_Guide.md)

### Google OAuth
- NextAuth Google provider integration
- Single Sign-On support
- Profile synchronization

### Traditional Authentication
- Tax ID + password authentication
- JWT token-based sessions
- Password reset functionality

## API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - Traditional login
- `POST /api/auth/register` - User registration
- `GET /api/auth/signin?provider=apple` - Apple OAuth initiation
- `GET /api/auth/signin?provider=google` - Google OAuth initiation
- `POST /api/auth/oauth/apple` - Mobile Apple token validation
- `POST /api/auth/refresh` - Token refresh

### Product Endpoints
- `GET /api/products` - List products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)

### Order Endpoints
- `GET /api/orders` - List user orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/status` - Update order status (admin)

### Cart Endpoints
- `GET /api/cart` - Get cart contents
- `POST /api/cart/items` - Add item to cart
- `PUT /api/cart/items/:id` - Update cart item quantity
- `DELETE /api/cart/items/:id` - Remove item from cart

## Database Schema

### Core Models
- **User**: Platform users with authentication profiles
- **Product**: Catalog products with variants
- **Category**: Product categorization
- **Order**: Customer orders with line items
- **Cart**: Shopping cart with session management

### Authentication Models
- **Account**: OAuth provider accounts (Google, Apple)
- **Session**: User authentication sessions
- **VerificationToken**: Email verification tokens

## Deployment

### Web Application
1. Build the application:
   ```bash
   pnpm build
   ```

2. Deploy to your preferred platform:
   - Vercel (recommended for Next.js)
   - AWS Amplify
   - Self-hosted with Docker

### Mobile Application
1. Build iOS:
   ```bash
   cd apps/mobile
   eas build --platform ios
   ```

2. Build Android:
   ```bash
   cd apps/mobile
   eas build --platform android
   ```

3. Submit to app stores:
   - Apple App Store
   - Google Play Store

### Environment Variables
Required environment variables for production:

```bash
# Database
DATABASE_URL=postgresql://...

# Authentication
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://your-domain.com

# Apple Sign-In
APPLE_CLIENT_ID=com.example.ceo-platform.service
APPLE_CLIENT_SECRET=...
APPLE_TEAM_ID=...
APPLE_KEY_ID=...

# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

## Testing Strategy

### Unit Tests
- Component testing with React Testing Library
- Utility function testing
- API route testing

### Integration Tests
- Authentication flow testing
- API endpoint integration
- Database operations

### End-to-End Tests
- Complete user workflows
- Cross-platform testing
- Performance testing

### Mobile Testing
- Component testing with React Native Testing Library
- Native module testing
- Device-specific testing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests for new functionality
5. Submit a pull request

### Code Style
- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Conventional commits for commit messages

## Documentation

- [Authentication Documentation](docs/authentication/) - Authentication setup and configuration
- [API Documentation](docs/api/) - API endpoints and usage
- [Deployment Guide](docs/deployment/) - Deployment instructions
- [Testing Guide](docs/testing/) - Testing strategies and procedures

## Support

For issues and questions:
1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information

## License

Proprietary - All rights reserved.