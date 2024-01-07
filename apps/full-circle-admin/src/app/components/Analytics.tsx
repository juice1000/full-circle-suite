import { getUsers, getMessages } from '@libs/dynamo-db-cloud-api';
import { Message, User } from '@libs/dynamo-db';
import { useState, useEffect } from 'react';
import { getMonthName, getWeek } from '../../utls';
import ball_loader from '../../assets/Ball-Loader.gif';

interface UserMessages {
  user: User;
  messages: Message[];
}
const today = new Date();

const Analytics = () => {
  const [loaded, setLoaded] = useState(false);
  const [users, setUsers] = useState<UserMessages[]>([]);

  useEffect(() => {
    getUsers().then((users) => {
      if (users) {
        Promise.all(
          users.map((user: User) => {
            user.created = new Date(user.created);
            return getMessages(user.id).then((messages) => {
              messages.forEach((message: Message) => {
                message.created = new Date(message.created);
              });
              return {
                user: user,
                messages: messages,
              };
            });
          })
        ).then((userMessages) => {
          // console.log('userMessages: ', userMessages);
          setUsers(userMessages);
          setLoaded(true);
        });
      }
    });
  }, []);

  const newUsersThisMonth = getNewUsersThisMonth(users);
  const usersToday = getUsersToday(users);
  const activeUsersThisWeek = getActiveUsersThisWeek(users);
  const activeUsersThisMonth = getActiveUsersThisMonth(users);

  const dailyActiveUsers = getDailyActiveUserRatio(users);
  // console.log('usersToday: ', usersToday);

  const messagesPerDay = averageMessagesPerDay(users);
  return (
    <div className="m-14">
      <main>
        <h1 className="text-6xl font-bold">Analytics</h1>
        {!loaded ? (
          <div className="w-full flex justify-center">
            <img className="w-96 h-96" src={ball_loader} alt="loader" />
          </div>
        ) : (
          <div className="my-12">
            <div className="2xl:w-3/4 grid grid-cols-3 gap-10 [&>div]:w-56">
              <div className="py-4 px-8 bg-primary-dark rounded-full grid justify-items-center">
                <p>Total Users</p>
                <h3>{users.length}</h3>
              </div>
              <div className="py-4 px-8 bg-primary-dark rounded-full grid justify-items-center">
                <p>New Users [{getMonthName(today.getMonth())}]</p>
                <h3>{newUsersThisMonth.length}</h3>
              </div>
              <div className="py-4 px-8 bg-primary-dark rounded-full grid justify-items-center">
                <p>Users Today</p>
                <h3> {usersToday.length}</h3>
              </div>
              <div className="py-4 px-8 bg-primary-dark rounded-full grid justify-items-center">
                <p>Daily Active Users</p>
                <h3>
                  {Math.floor(dailyActiveUsers.length / users.length) * 100}%
                </h3>
              </div>

              <div className="py-4 px-8 bg-primary-dark rounded-full grid justify-items-center">
                <p>Users This Week</p>
                <h3>
                  {' '}
                  {Math.floor(activeUsersThisWeek.length / users.length) * 100}%
                </h3>
              </div>
              <div className="py-4 px-8 bg-primary-dark rounded-full grid justify-items-center">
                <p>Users This Month</p>
                <h3>
                  {' '}
                  {Math.floor(activeUsersThisMonth.length / users.length) * 100}
                  %
                </h3>
              </div>
              <div className="py-4 px-8 bg-primary-dark rounded-full grid justify-items-center text-center">
                <p>Average Message Count / Day</p>
                <h3> {messagesPerDay}</h3>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

function getNewUsersThisMonth(users: UserMessages[]) {
  return users.filter((user: UserMessages) => {
    return (
      user.user.created.getMonth() === today.getMonth() &&
      user.user.created.getFullYear() === today.getFullYear()
    );
  });
}

function getUsersToday(users: UserMessages[]) {
  return users.filter((user) => {
    return (
      user.messages.find(
        (message) => message.created.toDateString() === today.toDateString()
      ) !== undefined
    );
  });
}

function getActiveUsersThisWeek(users: UserMessages[]) {
  return users.filter((user: UserMessages) => {
    return (
      user.messages.find(
        (message: Message) =>
          getWeek(message.created) === getWeek(today) &&
          message.created.getFullYear() === today.getFullYear()
      ) !== undefined
    );
  });
}

function getActiveUsersThisMonth(users: UserMessages[]) {
  return users.filter((user: UserMessages) => {
    return (
      user.messages.find(
        (message: Message) =>
          message.created.getMonth() === today.getMonth() &&
          message.created.getFullYear() === today.getFullYear()
      ) !== undefined
    );
  });
}

function getDailyActiveUserRatio(users: UserMessages[]) {
  const daysOfCurrentMonth = today.getDate();
  const filteredUsers = users.filter((user: UserMessages) => {
    const datesThisMonth = user.messages
      .filter((message: Message) => {
        return (
          message.created.getMonth() === today.getMonth() &&
          message.created.getFullYear() === today.getFullYear()
        );
      })
      .map((message: Message) => {
        return message.created.toDateString();
      });
    const uniqueDatesThisMonth = [...new Set(datesThisMonth)];

    // We check if the user has sent at least 3 messages each day he used the bot
    const result = isThreeMessagesPerDay(datesThisMonth);
    if (result) return true;

    // Then we check if the user has 70% participation rate in the current month
    return uniqueDatesThisMonth.length / daysOfCurrentMonth > 0.7;
  });
  // console.log(filteredUsers);

  return filteredUsers;
}

function averageMessagesPerDay(users: UserMessages[]) {
  const messagesPerDay = users.map((user: UserMessages) => {
    const messagesCreated = user.messages.map((message: Message) =>
      message.created.toDateString()
    );

    const uniqueCreatedDates = [...new Set(messagesCreated)];

    const result = messagesPerDayCount(messagesCreated);
    return Math.round(
      result.reduce((acc, curr) => acc + curr, 0) / uniqueCreatedDates.length
    );
  });
  // console.log(messagesPerDay);
  return Math.round(
    messagesPerDay.reduce((acc, curr) => acc + curr, 0) / messagesPerDay.length
  );
}

function messagesPerDayCount(createdDates: string[]): number[] {
  const itemCounts = createdDates.reduce((counts, item) => {
    if (item in counts) {
      counts[item]++;
    } else {
      counts[item] = 1;
    }
    return counts;
  }, {} as Record<string, number>);

  return Object.values(itemCounts);
}

function isThreeMessagesPerDay(createdDates: string[]): boolean {
  const itemCounts = createdDates.reduce((counts, item) => {
    if (item in counts) {
      counts[item]++;
    } else {
      counts[item] = 1;
    }
    return counts;
  }, {} as Record<string, number>);

  for (const count of Object.values(itemCounts)) {
    if (count < 3) {
      return false;
    }
  }

  return true;
}

export default Analytics;
