// eslint-disable-next-line @typescript-eslint/no-unused-vars
import styles from './App.module.css';

import { Route, Routes, Link, BrowserRouter as Router } from 'react-router-dom';
import SidebarNavigation from './components/SidebarNavigation';
import Dashboard from './components/Dashboard';
import PageNotFound from './components/PageNotFound';
import { useState } from 'react';
import ControlPanel from './components/ControlPanel';
import Settings from './components/Settings';

function RenderItem({
  loggedIn,
  loginStatusResolved,
}: {
  loggedIn: boolean;
  loginStatusResolved: boolean;
}) {
  return (
    <Router>
      <div className="basis-1/6">
        <SidebarNavigation />
      </div>
      <div className="basis-5/6 overflow-scroll p-14">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/controls" element={<ControlPanel />} />
          <Route path="/settings" element={<Settings />} />
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
