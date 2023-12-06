import Redis from 'ioredis';

const redis = new Redis();

// we query from our database
async function query(id) {
  return await redis.lrange(
    'full-circle-chatbot',
    0,
    -1,
    function (err, reply) {
      return reply;
    }
  );
}

// we write into our database
async function writeToDB(msg, id) {
  try {
    await redis.rpush(['full-circle-chatbot', JSON.stringify(msg)]);
  } catch (err) {
    console.log(err);
  }

  return;
}

async function deleteEntries(id) {}

module.exports = { query, writeToDB };
