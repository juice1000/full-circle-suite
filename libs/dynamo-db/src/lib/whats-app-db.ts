import { dbClient } from './dynamo-db';
import { PutItemCommand } from '@aws-sdk/client-dynamodb';
import { v4 as uuidv4 } from 'uuid';

import { Message } from './db-types';

export async function getMessages(
  userId: string,
  limit?: number
): Promise<Message[] | null> {
  try {
    const params = {
      TableName: 'full-circle-messages',
      KeyConditionExpression: 'userId = :value',
      ScanIndexForward: true,
      Limit: limit || 5,
      ExpressionAttributeValues: {
        ':value': { S: userId }, // Use the appropriate data type (S for String, N for Number, etc.)
      },
    };
    //   const command = new GetItemCommand(params);
    const response = await dbClient.query(params);

    if (response.Items && response.Items.length > 0) {
      const items = response.Items;
      const messages: Message[] = [];
      items.forEach((item) => {
        const message: Message = {
          id: item.id.S,
          created: new Date(Number(item.created.N)),
          userId: userId,
          userMessage: item.userMessage.S,
          gptResponse: item.gptResponse.S,
          gptModel: item.gptModel.S,
        };
        messages.push(message);
      });

      return messages;
    } else {
      console.log('no message found');
      return null;
    }
  } catch (err) {
    console.log('no message found');
    return null;
  }
}

export async function createMessage(
  userId: string,
  userMessage: string,
  gptResponse: string
) {
  const message: Message = {
    id: uuidv4(),
    created: new Date(),
    userId: userId,
    userMessage: userMessage,
    gptResponse: gptResponse,
    gptModel: process.env.GPT_MODEL || '',
  };
  const putCommand = new PutItemCommand({
    TableName: 'full-circle-messages',
    Item: {
      id: { S: message.id },
      created: { N: `${message.created.getTime()}` },
      userId: { S: `${message.userId}` },
      userMessage: { S: message.userMessage },
      gptResponse: { S: message.gptResponse },
      gptModel: { S: message.gptModel },
    },
  });
  await dbClient.send(putCommand);
  console.log('created new message');

  return message;
}
