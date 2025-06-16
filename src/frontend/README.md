# LakePulse Frontend Setup Guide

This guide will help you set up and run the LakePulse frontend project locally.

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Git


## Project Setup Steps

1. **Clone the Repository**
   ```bash
   git clone [repository-url]
   cd lake-pulse/src/frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**

   Create a `.env` file in the frontend root directory with the following variables:

   ```plaintext
   VITE_AUTHORITY=https://cognito-idp.us-east-1.amazonaws.com/[USER_POOL_ID]
   VITE_CLIENT_ID=[YOUR_CLIENT_ID]
   VITE_REDIRECT_URI=http://localhost:5173
   VITE_RESPONSE_TYPE=code
   VITE_SCOPE=email openid phone
   VITE_POST_LOGOUT_REDIRECT_URI=http://localhost:5173
   VITE_COGNITO_DOMAIN=https://[DOMAIN_PREFIX].auth.us-east-1.amazoncognito.com
   VITE_BASE_URL=https://localhost:44359
   ```

   Replace the placeholder values in square brackets with your actual AWS Cognito configuration.

## AWS Cognito Setup

1. **User Pool Configuration**
   - Navigate to AWS Cognito Console
   - Create or select your User Pool
   - Configure sign-in options (email/username)
   - Set password policies
   - Configure MFA settings if required

2. **App Client Setup**
   - Create an app client in your User Pool
   - Enable necessary OAuth flows
   - Configure callback URLs
   - Note down the Client ID

3. **Identity Pool Setup**
   - Create a new Identity Pool
   - Link it with your User Pool
   - Configure IAM roles for authenticated/unauthenticated users
   - Note down the Identity Pool ID

## AWS Cognito Configuration in Code

The Cognito authentication is configured in two main files:

1. **main.tsx**
   ```typescript
   // Cognito configuration setup
   const cognitoAuthConfig = {
     authority: import.meta.env.VITE_AUTHORITY,
     client_id: import.meta.env.VITE_CLIENT_ID,
     redirect_uri: import.meta.env.VITE_REDIRECT_URI,
     response_type: import.meta.env.VITE_RESPONSE_TYPE,
     scope: import.meta.env.VITE_SCOPE,
     post_logout_redirect_uri: import.meta.env.VITE_POST_LOGOUT_REDIRECT_URI,
     userStore: new WebStorageStateStore({ store: window.localStorage }),
     automaticSilentRenew: true,
     loadUserInfo: true,
     monitorSession: true
   };
   ```

2. **App.tsx**
   - Uses `useAuth` hook from `react-oidc-context` for authentication state management
   - Handles authentication states (loading, error, authenticated)
   - Protects routes based on authentication status

## Important Notes About Authentication

- The application uses `react-oidc-context` for handling authentication
- Authentication state is managed globally through the AuthProvider
- Protected routes are only accessible after successful authentication
- User session is stored in localStorage for persistence
- Automatic token renewal is enabled
- User information is automatically loaded upon authentication

## Running the Project

1. **Development Mode**
   ```bash
   npm start
   ```
   This will start the development server on http://localhost:5173

2. **Production Build**
   ```bash
   npm run build
   ```

## Important Notes

- Ensure all environment variables are properly set before starting the application
- The AWS Cognito User Pool should have the following attributes configured:
  - Email (required)
  - Name (optional)
  - Custom attributes for user roles if applicable
- Make sure your IAM roles have appropriate permissions for S3 access
- Check CORS settings in your backend API if you face any API connection issues

## Common Issues and Solutions

1. **Cognito Authentication Issues**
   - Verify User Pool ID and Client ID in .env file
   - Check if the user is confirmed in Cognito Console
   - Ensure proper CORS settings in Cognito

2. **API Connection Issues**
   - Verify API URL in .env file
   - Check if backend server is running
   - Verify network connectivity

## Additional Resources

- [AWS Cognito Documentation](https://docs.aws.amazon.com/cognito/)
- [React Documentation](https://reactjs.org/docs/getting-started.html)

## Support

For any additional help or issues, please contact the development team or create an issue in the project repository.



