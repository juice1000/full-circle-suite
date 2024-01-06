import { StrictMode } from 'react';
// import { initializeDB } from '@libs/dynamo-db';
import * as ReactDOM from 'react-dom/client';
import { Amplify } from 'aws-amplify';
import awsmobile from './aws-exports';

import App from './app/App';
import './styles.css';

Amplify.configure(awsmobile);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
// initializeDB(import.meta.env.VITE_AWS_REGION_EU_NORTH);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
