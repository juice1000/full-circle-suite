import { ddbDocClient } from './dynamo-db';
// import { PutItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';
import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

import { Message } from './db-types';

export async function getMessages(
  userId: string,
  limit?: number
): Promise<Message[] | null> {
  try {
    const params = new QueryCommand({
      TableName: 'full-circle-messages',
      KeyConditionExpression: 'userId = :value',
      ScanIndexForward: false,
      Limit: limit || 5,
      ExpressionAttributeValues: {
        ':value': userId, // Use the appropriate data type (S for String, N for Number, etc.)
      },
    });
    //   const command = new GetItemCommand(params);
    const response = await ddbDocClient.send(params);

    if (response.Items && response.Items.length > 0) {
      const items = response.Items;
      const messages: Message[] = [];
      items.forEach((item) => {
        const message: Message = {
          id: item.id,
          created: new Date(item.created),
          userId: userId,
          userMessage: item.userMessage,
          gptResponse: item.gptResponse,
          gptModel: item.gptModel,
        };
        messages.push(message);
      });
      // we need to reverse the order so our gpt model gets the latest message at last
      return messages.reverse();
    } else {
      console.log('no messages found');
      return null;
    }
  } catch (err) {
    console.log('no messages found');
    return null;
  }
}

export async function createMessage(
  userId: string,
  userMessage: string,
  gptResponse: string,
  gptModelId: string
) {
  const message: Message = {
    id: uuidv4(),
    created: new Date(),
    userId: userId,
    userMessage: userMessage,
    gptResponse: gptResponse,
    gptModel: gptModelId,
  };
  const putCommand = new PutCommand({
    TableName: 'full-circle-messages',
    Item: { ...message, created: message.created.toISOString() },
  });
  await ddbDocClient.send(putCommand);
  console.log('created new message');

  return message;
}
