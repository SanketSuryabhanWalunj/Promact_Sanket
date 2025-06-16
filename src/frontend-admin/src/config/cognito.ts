   // src/config/cognito.ts
   import { CognitoUserPool } from "amazon-cognito-identity-js";

   const poolData = {
     UserPoolId: import.meta.env.VITE_USER_POOL_ID, // Accessing the environment variable
     ClientId: import.meta.env.VITE_CLIENT_ID,      // Accessing the environment variable
   };

   if (!poolData.UserPoolId || !poolData.ClientId) {
     throw new Error("Both UserPoolId and ClientId are required.");
   }

   export const userPool = new CognitoUserPool(poolData);