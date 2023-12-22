// eslint-disable-next-line @typescript-eslint/no-unused-vars
import styles from './App.module.css';

import { Route, Routes, Link, BrowserRouter as Router } from 'react-router-dom';
import SidebarNavigation from './components/SidebarNavigation';
import Dashboard from './components/Dashboard';
import PageNotFound from './components/PageNotFound';
import { useState } from 'react';

function RenderItem({
  loggedIn,
  loginStatusResolved,
}: {
  loggedIn: boolean;
  loginStatusResolved: boolean;
}) {
  const handleSignOut = () => {
    console.log('Sign Out');
  };
  return (
    <Router>
      <div className="basis-1/6">
        <SidebarNavigation onSignOut={handleSignOut} />
      </div>
      <div className="basis-5/6 overflow-scroll p-14">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginStatusResolved, setLoginStatus] = useState(false);

  // useEffect(() => {
  //   onAuthStateChanged(auth, async (_user) => {
  //     if (_user) {
  //       setLoggedIn(true);
  //       setLoginStatus(true);
  //       console.log('user is logged in!');
  //     } else {
  //       setLoggedIn(false);
  //       setLoginStatus(true);
  //       console.log('user is not logged in');
  //     }
  //   });
  // }, []);

  return (
    <div className="flex flex-row h-screen">
      <RenderItem
        loggedIn={loggedIn}
        loginStatusResolved={loginStatusResolved}
      />
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
