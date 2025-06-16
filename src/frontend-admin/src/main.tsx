import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import'../src/components/common.css'
import App from './App'
import { AuthProvider } from "react-oidc-context";
import { WebStorageStateStore, UserManager } from "oidc-client-ts";
import { APP_STRINGS } from './constants/strings';


// Initialize UserManager
const cognitoAuthConfig = {
  authority: import.meta.env.VITE_AUTHORITY,
  client_id: import.meta.env.VITE_CLIENT_ID,
  redirect_uri: import.meta.env.VITE_REDIRECT_URI,
  response_type: import.meta.env.VITE_RESPONSE_TYPE,
  scope: import.meta.env.VITE_SCOPE,
  post_logout_redirect_uri: import.meta.env.VITE_POST_LOGOUT_REDIRECT_URI,
  userStore: new WebStorageStateStore({ store: window.localStorage }),
  stateStore: new WebStorageStateStore({ store: window.sessionStorage }),
  automaticSilentRenew: true,
  loadUserInfo: true,
  monitorSession: true,
  onSigninCallback: () => {
    window.history.replaceState({}, document.title, window.location.pathname);
  }
};
// Initialize UserManager
const userManager = new UserManager(cognitoAuthConfig);

// Update the token expiration handling
userManager.events.addAccessTokenExpiring(() => {
  userManager.signinSilent().catch(error => {
    console.error(APP_STRINGS.SILENT_RENEWAL_FAILED, error);
    localStorage.removeItem(APP_STRINGS.OIDC_KEY);
    localStorage.removeItem("adminToken");
    localStorage.removeItem("currentUserProfile");
    sessionStorage.setItem(APP_STRINGS.AUTH_EXPIRED_KEY, 'true');
    window.location.href = APP_STRINGS.LOGIN_PATH;
  });
});

// Token expired
userManager.events.addAccessTokenExpired(() => {
  localStorage.removeItem(APP_STRINGS.OIDC_KEY);
  localStorage.removeItem("adminToken");
  localStorage.removeItem("currentUserProfile");
  sessionStorage.setItem(APP_STRINGS.AUTH_EXPIRED_KEY, 'true');
  window.location.href = APP_STRINGS.LOGIN_PATH;
});

// Add session monitoring
userManager.events.addUserSignedOut(() => {
  localStorage.removeItem(APP_STRINGS.OIDC_KEY);
  localStorage.removeItem("adminToken");
  localStorage.removeItem("currentUserProfile");
  sessionStorage.removeItem(APP_STRINGS.AUTH_EXPIRED_KEY);
  window.location.href = APP_STRINGS.LOGIN_PATH;
});



// Add this to check if user is already loaded
userManager.getUser().then(user => {
  if (user) {
    userManager.events.load(user);
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <App />
    </AuthProvider>
  </StrictMode>
)
