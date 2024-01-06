import { StrictMode } from 'react';
// import { initializeDB } from '@libs/dynamo-db';
import * as ReactDOM from 'react-dom/client';
import { Amplify } from 'aws-amplify';
// import awsmobile from './aws-exports';

import App from './app/App';
import './styles.css';

const amplifyconfig = {
  aws_project_region: import.meta.env.VITE_AWS_REGION_EU_NORTH,
  aws_cognito_identity_pool_id: import.meta.env
    .VITE_AWS_COGNITO_ITENTITY_POOL_ID,
  aws_cognito_region: import.meta.env.VITE_AWS_REGION_EU_NORTH,
  aws_user_pools_id: import.meta.env.VITE_AWS_USER_POOLS_ID,
  aws_user_pools_web_client_id: import.meta.env
    .VITE_AWS_USER_POOL_WEB_CLIENT_ID,
  oauth: {},
  aws_cognito_username_attributes: ['EMAIL'],
  aws_cognito_social_providers: [],
  aws_cognito_signup_attributes: [],
  aws_cognito_mfa_configuration: 'OFF',
  aws_cognito_mfa_types: ['SMS'],
  aws_cognito_password_protection_settings: {
    passwordPolicyMinLength: 8,
    passwordPolicyCharacters: [],
  },
  aws_cognito_verification_mechanisms: ['EMAIL'],
};

Amplify.configure(amplifyconfig);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
// initializeDB(import.meta.env.VITE_AWS_REGION_EU_NORTH);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
