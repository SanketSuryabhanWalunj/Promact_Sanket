import { Environment } from '@abp/ng.core';

const baseUrl = 'http://localhost:4200';

export const environment = {
  production: false,
  application: {
    baseUrl,
    name: 'VirtaulAid',
    logoUrl: '',
  },
  oAuthConfig: {
    issuer: 'https://localhost:44373/',
    redirectUri: baseUrl,
    clientId: 'VirtaulAid_App',
    responseType: 'code',
    scope: 'offline_access VirtaulAid',
    requireHttps: true,
  },
  apis: {
    default: {
      url: 'https://localhost:44373',
      rootNamespace: 'VirtaulAid',
    },
  },
} as Environment;
