import Redis from 'ioredis';

//console.log('REDIS URL: ', process.env.REDIS_URL);
const redis = new Redis(process.env.REDIS_URL, { family: 6 });

redis.on('error', (err) => {
  // We don't need to start the server if Redis connection failed
  console.error('REDIS CONNECTION: FAILED\n', err);
  process.exit(0);
});

interface redisUserData {
  messages: string;
  lastMessage: Date;
}
// we query from redis
export async function findKey(id: string): Promise<redisUserData | null> {
  const data = await redis.get(id, function (err, reply) {
    if (err) {
      console.error(err);
    } else {
      return reply;
    }
  });
  const parsedData = JSON.parse(data);

  return parsedData
    ? {
        messages: parsedData.messages,
        lastMessage: new Date(parsedData.lastMessage),
      }
    : null;
}

// we write into redis
export async function writeKey(id: string, data: redisUserData) {
  try {
    await redis.set(id, JSON.stringify(data));
  } catch (err) {
    console.log(err);
  }

  return;
}

// we delete from redis
export async function deleteKey(id: string) {
  try {
    await redis.del(id);
  } catch (error) {
    console.error('delete key failed: ', error);
  }
}
