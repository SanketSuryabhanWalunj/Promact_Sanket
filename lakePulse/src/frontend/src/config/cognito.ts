// src/config/cognito.ts
import { CognitoUserPool } from "amazon-cognito-identity-js";

const poolData = {
  UserPoolId: import.meta.env.VITE_USER_POOL_ID, // Replace with your Cognito User Pool ID
  ClientId: import.meta.env.VITE_CLIENT_ID,     // Replace with your Cognito App Client ID
};



if (!poolData.UserPoolId || !poolData.ClientId) {
  throw new Error("Both UserPoolId and ClientId are required.");
}

if (!/^[a-z]{2}-[a-z]+-\d+_[a-zA-Z0-9]+$/.test(poolData.UserPoolId)) {
  throw new Error(`Invalid UserPoolId format: ${poolData.UserPoolId}. Ensure it follows the format 'region_identifier_poolId'.`);
}

export const userPool = new CognitoUserPool(poolData);