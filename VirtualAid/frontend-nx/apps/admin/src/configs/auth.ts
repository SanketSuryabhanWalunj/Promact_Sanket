export default {
  meEndpoint: '/auth/me',
  loginEndpoint: '/jwt/login',
  registerEndpoint: '/jwt/register',
  storageTokenKeyName: 'vaAdminAccessToken',
  storageUserDataKeyName: 'vaAdminUser',
  onTokenExpiration: 'refreshToken' // logout | refreshToken
}
