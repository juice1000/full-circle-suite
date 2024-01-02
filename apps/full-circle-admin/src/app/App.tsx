// eslint-disable-next-line @typescript-eslint/no-unused-vars
import styles from './App.module.css';

import { Route, Routes, Link, BrowserRouter as Router } from 'react-router-dom';
import SidebarNavigation from './components/SidebarNavigation';
import Dashboard from './components/Dashboard';
import PageNotFound from './components/PageNotFound';
import ControlPanel from './components/ControlPanel';
import Settings from './components/Settings';
// import loader from '../assets/Ball-Loader.gif';

import { Amplify } from 'aws-amplify';
import { Authenticator, ThemeProvider } from '@aws-amplify/ui-react';
import { AuthStyle } from './AuthUI';
import '@aws-amplify/ui-react/styles.css';
import config from '../amplifyconfiguration.json';
// import { dbClient } from '@libs/dynamo-db';
import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
// import * as AWS from 'aws-sdk'
// import { DynamoDB } from '@aws-sdk/client-dynamodb';

const dbClient = new DynamoDBClient({ region: 'eu-north-1' });

// const docClient = new AWS.DynamoDB.DocumentClient(configi);
// console.log(docClient);
(async function () {
  // const e = await dbClient.listTables({});
  // console.log(e);
  const params = new ScanCommand({
    TableName: 'full-circle-users',
    FilterExpression: 'phone = :value',
    ExpressionAttributeValues: {
      ':value': { S: '6583226020' }, // Use the appropriate data type (S for String, N for Number, etc.)
    },
  });
  dbClient.send(params, function (err, data) {
    if (err) {
      console.log(err);
    } else {
      console.log(data);
    }
  });
})();

Amplify.configure(config);

function RenderItem() {
  return (
    <ThemeProvider theme={AuthStyle()}>
      <Authenticator
        hideSignUp={true}
        className="w-screen h-full bg-primary-light"
      >
        {({ signOut }) => (
          <div className="flex w-screen">
            <Router>
              <div className="basis-1/6">
                <SidebarNavigation signOut={signOut} />
              </div>
              <div className="basis-5/6 overflow-scroll p-14">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/analytics" element={<Dashboard />} />
                  <Route path="/controls" element={<ControlPanel />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<PageNotFound />} />
                </Routes>
              </div>
            </Router>
          </div>
        )}
      </Authenticator>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <div className="flex flex-row h-screen">
      <RenderItem />
    </div>
  );
}

if (import.meta.vitest) {
  // add tests related to your file here
  // For more information please visit the Vitest docs site here: https://vitest.dev/guide/in-source.html

  const { it, expect, beforeEach } = import.meta.vitest;
  let render: typeof import('@testing-library/react').render;

  beforeEach(async () => {
    render = (await import('@testing-library/react')).render;
  });

  it('should render successfully', () => {
    const { baseElement } = render(
      <Router>
        <App />
      </Router>
    );
    expect(baseElement).toBeTruthy();
  });

  it('should have a greeting as the title', () => {
    const { getByText } = render(
      <Router>
        <App />
        {/* START: routes */}
        {/* These routes and navigation have been generated for you */}
        {/* Feel free to move and update them to fit your needs */}
        <br />
        <hr />
        <br />
        <div role="navigation">
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/page-2">Page 2</Link>
            </li>
          </ul>
        </div>
        <Routes>
          <Route
            path="/"
            element={
              <div>
                This is the generated root route.{' '}
                <Link to="/page-2">Click here for page 2.</Link>
              </div>
            }
          />
          <Route
            path="/page-2"
            element={
              <div>
                <Link to="/">Click here to go back to root page.</Link>
              </div>
            }
          />
        </Routes>
        {/* END: routes */}
      </Router>
    );
    expect(getByText(/Welcome full-circle-admin/gi)).toBeTruthy();
  });
}
