import { getUsers, getMessages } from '@libs/dynamo-db-cloud-api';
import { Message, User } from '@libs/dynamo-db';
import { useState, useEffect } from 'react';
import { getWeek } from '../../utls';
import ball_loader from '../../assets/Ball-Loader.gif';
import Plot from 'react-plotly.js';
import { Data } from 'plotly.js';

interface UserMessages {
  user: User;
  messages: Message[];
}
const today = new Date();

const Analytics = () => {
  const [loaded, setLoaded] = useState(false);
  const [users, setUsers] = useState<UserMessages[]>([]);

  useEffect(() => {
    getUsers()
      .then(async (users) => {
        if (users && users.length > 0) {
          const userMessages: UserMessages[] = [];

          let userItem = users.shift();
          while (userItem) {
            const user = { ...userItem };

            user.created = new Date(user.created);
            const messages = await getMessages(user.id);
            if (messages && messages.length > 0) {
              messages.forEach((message: Message) => {
                message.created = new Date(message.created);
              });
            }
            userMessages.push({
              user: user,
              messages: messages && messages.length > 0 ? messages : [],
            });
            userItem = users.shift();
          }
          const filteredUserMessages = userMessages.filter(
            (userMessage: UserMessages) =>
              !['4917643209870', '6583226020', '6583226069'].includes(
                userMessage.user.phone
              )
          );

          setUsers(filteredUserMessages);
        }
      })
      .then(() => {
        setLoaded(true);
      });
  }, []);

  const newUsersThisMonth = getNewUsersThisMonth(users);
  const usersToday = getUsersToday(users);
  const activeUsersThisWeek = getActiveUsersThisWeek(users);
  const activeUsersThisMonth = getActiveUsersThisMonth(users);
  const usersThatSentMessages = getUsersThatSentMessages(users);
  const dailyActiveUsers = getDailyActiveUserRatio(users);
  const timeSetupToFirstMessage = getTimeSetupToFirstMessage(users);

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
              <div className="py-4 px-8 bg-primary-dark rounded-full grid justify-items-center text-center">
                <p>Total Registered Users</p>
                <h3>{users.length}</h3>
              </div>
              <div className="py-4 px-8 bg-primary-dark rounded-full grid justify-items-center text-center">
                <p>New Users This Month</p>
                <h3>{newUsersThisMonth.length}</h3>
              </div>
              <div className="py-4 px-8 bg-primary-dark rounded-full grid justify-items-center text-center">
                <p>Active Users</p>
                <h3>{usersThatSentMessages.length}</h3>
              </div>
              <div className="py-4 px-8 bg-primary-dark rounded-full grid justify-items-center text-center">
                <p>Users Today</p>
                <h3>{usersToday.length}</h3>
              </div>

              <div className="py-4 px-8 bg-primary-dark rounded-full grid justify-items-center text-center">
                <p>Users This Week</p>
                <h3>
                  {Math.round(
                    (activeUsersThisWeek.length / users.length) * 100
                  )}
                  %
                </h3>
              </div>
              <div className="py-4 px-8 bg-primary-dark rounded-full grid justify-items-center text-center">
                <p>Users This Month</p>
                <h3>
                  {' '}
                  {Math.round(
                    (activeUsersThisMonth.length / users.length) * 100
                  )}
                  %
                </h3>
              </div>
              <div className="py-4 px-8 bg-primary-dark rounded-full grid justify-items-center text-center">
                <p>Daily Active Users</p>
                <h3>
                  {Math.round((dailyActiveUsers.length / users.length) * 100)}%
                </h3>
              </div>
              <div className="py-4 px-8 bg-primary-dark rounded-full grid justify-items-center text-center">
                <p>Average Message Count / Day</p>
                <h3> {messagesPerDay}</h3>
              </div>
            </div>
            <div className="mt-10">
              <Boxplot timeDifferences={timeSetupToFirstMessage} />
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
    const filteredUsers =
      user.messages.find(
        (message: Message) =>
          getWeek(message.created) === getWeek(today) &&
          message.created.getFullYear() === today.getFullYear()
      ) !== undefined;

    return filteredUsers;
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
    const uniqueDatesThisMonth = [...new Set(...datesThisMonth)];

    // We check if the user has sent at least 3 messages each day he used the bot
    // if (user.user.phone === '4917643209870') {
    //   console.log('datesThisMonth: ', datesThisMonth);
    // }

    const result = isThreeMessagesPerDay(datesThisMonth);
    if (result) return true;

    // Then we check if the user has 70% participation rate in the current month
    return uniqueDatesThisMonth.length / daysOfCurrentMonth > 0.7;
  });
  // console.log(filteredUsers);

  return filteredUsers;
}

function getUsersThatSentMessages(users: UserMessages[]) {
  return users.filter((user: UserMessages) => {
    return user.messages.length > 0;
  });
}

function averageMessagesPerDay(users: UserMessages[]) {
  const messagesPerDay = users.map((user: UserMessages) => {
    const messagesCreated = user.messages.map((message: Message) =>
      message.created.toDateString()
    );

    const uniqueCreatedDates = [...new Set(messagesCreated)];

    const messagesPerDayCnt = messagesPerDayCount(messagesCreated);
    const messagesPerDay = Math.round(
      messagesPerDayCnt.reduce((acc, curr) => acc + curr, 0) /
        uniqueCreatedDates.length
    );
    return messagesPerDay ? messagesPerDay : 0;
  });
  // console.log(
  //   'average message count per day: ',
  //   messagesPerDay.reduce((acc, curr) => acc + curr, 0) / messagesPerDay.length
  // );
  // console.log('messages per day: ', messagesPerDay);

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
  if (createdDates.length < 3) return false;
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

function getTimeSetupToFirstMessage(users: UserMessages[]) {
  return users.map((user: UserMessages) => {
    const messagesCreated = user.messages.map((message) =>
      message.created.getTime()
    );
    const earliestMessageTime = Math.min(...messagesCreated);

    const firstMessage = user.messages.find(
      (message) => message.created.getTime() === earliestMessageTime
    );
    if (!firstMessage) return 0;
    return (
      // we get the hourly difference
      (firstMessage.created.getTime() - user.user.created.getTime()) /
      (1000 * 60 * 60)
    );
  });
}

function Boxplot({ timeDifferences }: { timeDifferences: number[] }) {
  const trace: Data = {
    x: timeDifferences, // Your data here
    type: 'box',
    name: '',
  };

  const layout = {
    title: 'Time Distribution from User Registration to First Bot Interaction',
    xaxis: {
      title: 'Hours',
      zeroline: false,
    },
  };

  return (
    <Plot
      data={[trace]}
      layout={layout}
      style={{ width: '100%', height: '100%' }}
    />
  );
}

export default Analytics;
