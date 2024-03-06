import { ddbDocClient } from './dynamo-db';
import { PutCommand, ScanCommand, GetCommand } from '@aws-sdk/lib-dynamodb';

import { BotMessage } from './db-types';

const tableName = 'full-circle-bot-messages';

export async function getAllBotMessages(): Promise<BotMessage[] | null> {
  try {
    const params = new ScanCommand({
      TableName: tableName,
    });

    const response = await ddbDocClient.send(params);

    if (response.Items && response.Items.length > 0) {
      const items = response.Items;
      const prompts: BotMessage[] = [];
      items.forEach((item) => {
        const prompt: BotMessage = {
          id: item.id,
          message: item.message,
        };
        prompts.push(prompt);
      });

      return prompts;
    } else {
      console.log('no bot messages found');
      return null;
    }
  } catch (err) {
    console.log('no bot messages found');
    return null;
  }
}

export async function getBotMessage(id: string): Promise<BotMessage | null> {
  try {
    const params = new GetCommand({
      TableName: tableName,
      Key: {
        id: id,
      },
      // Limit: 1,
    });

    const response = await ddbDocClient.send(params);
    const item = response.Item;
    if (item) {
      const botMessage: BotMessage = {
        id: item.id,
        message: item.message,
      };

      return botMessage;
    } else {
      console.log('no bot message found');
      return null;
    }
  } catch (err) {
    console.log('no bot message found');
    return null;
  }
}

export async function writeBotMessage(id: string, message: string) {
  const botMessage: BotMessage = {
    id: id,
    message: message,
  };

  //await unsetCurrentPrompt();

  const putCommand = new PutCommand({
    TableName: 'full-circle-bot-messages',
    Item: {
      id: botMessage.id,
      message: botMessage.message,
    },
  });
  await ddbDocClient.send(putCommand);
  console.log('created new bot message');

  // modify all other system prompts as current

  return botMessage;
}
