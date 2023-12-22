import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function PageNotFound() {
  const navigate = useNavigate();
  function navigateLogin() {
    navigate('login');
  }
  return (
    <div className="flex flex-col items-center">
      <h1 className="mt-20 text-6xl font-bold">Page not found :(</h1>
      <h1 className="mt-10 text-xl">
        Perhaps this site doesn't exist or you don't have the permission to
        access it.
      </h1>
      <button
        onClick={navigateLogin}
        className="mt-4 block rounded-md bg-primary px-10 py-3 text-center text-sm font-semibold text-white shadow-sm hover:bg-primaryLight focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaryLight"
      >
        Back to Login
      </button>
    </div>
  );
}
