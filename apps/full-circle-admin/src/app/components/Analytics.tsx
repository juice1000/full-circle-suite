import { getUsers, updateUser } from '@libs/dynamo-db-cloud-api';
import { User } from '@libs/dynamo-db';
import { useState, useEffect } from 'react';

const Analytics = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    getUsers().then((users) => {
      setUsers(users);
    });
  }, []);

  const changeUser = async () => {
    if (users.length > 0) {
      const user = { ...users[0] };
      user.firstname = 'Ning';
      await updateUser(user);
    }
  };
  console.log(users[0]?.firstname);

  return (
    <div>
      <main>
        <h1 className="text-6xl font-bold">Analytics</h1>
        <button onClick={changeUser}>Change user</button>
        <div className=""></div>
        {/* Add more content and components as needed */}
      </main>
    </div>
  );
};

export default Analytics;
