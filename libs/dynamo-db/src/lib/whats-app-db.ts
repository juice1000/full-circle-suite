import { dbClient } from './dynamo-db';
import { PutItemCommand } from '@aws-sdk/client-dynamodb';
import { v4 as uuidv4 } from 'uuid';

import { Message } from './table-schemas';

export async function getMessages(userId: string): Promise<Message[] | null> {
  try {
    const params = {
      TableName: 'full-circle-messages',
      FilterExpression: 'userId = :value',
      ExpressionAttributeValues: {
        ':value': { S: userId }, // Use the appropriate data type (S for String, N for Number, etc.)
      },
      Limit: 5,
    };
    //   const command = new GetItemCommand(params);
    const response = await dbClient.scan(params);

    if (response.Items && response.Items.length > 0) {
      const items = response.Items;
      const messages: Message[] = [];
      items.forEach((item) => {
        const message: Message = {
          id: item.id.S || '',
          timestamp: new Date(Number(item.timestamp.N)) || new Date(),
          userId: userId,
          userMessage: item.userMessage.S || '',
          gptResponse: item.gptResponse.S || '',
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
    timestamp: new Date(),
    userId: userId,
    userMessage: userMessage,
    gptResponse: gptResponse,
  };
  const putCommand = new PutItemCommand({
    TableName: 'full-circle-messages',
    Item: {
      id: { S: message.id },
      timestamp: { N: `${message.timestamp.getTime()}` },
      userId: { S: `${message.userId}` },
      userMessage: { S: message.userMessage },
      gptResponse: { S: message.gptResponse },
    },
  });
  await dbClient.send(putCommand);
  console.log('created new message');

  return message;
}
