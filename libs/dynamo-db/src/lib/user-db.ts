import { dbClient } from './dynamo-db';
import { PutItemCommand } from '@aws-sdk/client-dynamodb';
import { v4 as uuidv4 } from 'uuid';

import { User } from './table-schemas';

export async function getUser(phone: string): Promise<User | null> {
  try {
    const params = {
      TableName: 'full-circle-users',
      FilterExpression: 'phone = :value',
      ExpressionAttributeValues: {
        ':value': { S: phone }, // Use the appropriate data type (S for String, N for Number, etc.)
      },
    };
    //   const command = new GetItemCommand(params);
    const response = await dbClient.scan(params);

    if (response.Items && response.Items.length > 0) {
      const item = response.Items[0];

      const user: User = {
        id: item.id.S || '',
        timestamp: new Date(Number(item.timestamp.N)),
        phone: item.phone.S || '',
        stressScore: Number(item.stressScore?.N) || 0,
      };
      return user;
    } else {
      console.log('no user found');
      return null;
    }
  } catch (err) {
    console.log('no user found');
    return null;
  }
}

export async function createUser(phone: string) {
  const user: User = {
    id: uuidv4(), // generate random UUID
    timestamp: new Date(),
    phone: phone,
    stressScore: 0,
  };
  const putCommand = new PutItemCommand({
    TableName: 'full-circle-users',
    Item: {
      id: { S: user.id },
      timestamp: { N: `${user.timestamp.getTime()}` },
      phone: { S: `${phone}` },
      stressScore: { N: '0' },
    },
  });
  await dbClient.send(putCommand);
  console.log('created new user');

  return user;
}
