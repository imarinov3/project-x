import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Amplify } from 'aws-amplify';
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito';
import config from './aws-exports';

// Configure Amplify
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: config.aws_user_pools_id,
      userPoolClientId: config.aws_user_pools_web_client_id,
      signUpVerificationMethod: 'code',
      loginWith: {
        email: true,
        phone: false,
        username: false
      }
    }
  }
});

// Configure token signing
cognitoUserPoolsTokenProvider.setKeyValueStorage({
  setItem: async (key: string, value: string) => {
    localStorage.setItem(key, value);
    return Promise.resolve();
  },
  getItem: async (key: string) => {
    return Promise.resolve(localStorage.getItem(key));
  },
  removeItem: async (key: string) => {
    localStorage.removeItem(key);
    return Promise.resolve();
  },
  clear: async () => {
    localStorage.clear();
    return Promise.resolve();
  }
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
