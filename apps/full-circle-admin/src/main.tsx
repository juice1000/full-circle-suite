import { StrictMode } from 'react';
// import { initializeDB } from '@libs/dynamo-db';
import * as ReactDOM from 'react-dom/client';
import App from './app/App';

import './styles.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
// initializeDB(import.meta.env.VITE_AWS_REGION_EU_NORTH);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
