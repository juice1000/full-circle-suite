import Redis from 'ioredis';

const redis = new Redis();

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
