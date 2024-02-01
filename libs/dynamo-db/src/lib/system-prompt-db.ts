import { ddbDocClient } from './dynamo-db';
import { UpdateCommand, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

import { GPTSystemPrompt } from './db-types';

export async function getAllSystemPrompts(): Promise<GPTSystemPrompt[] | null> {
  try {
    const params = new ScanCommand({
      TableName: 'full-circle-gpt-system-prompts',
      //   FilterExpression: 'current = :value',
      //   ExpressionAttributeValues: {
      //     ':value': { BOOL: name },
      //   },
    });

    const response = await ddbDocClient.send(params);

    if (response.Items && response.Items.length > 0) {
      const items = response.Items;
      const prompts: GPTSystemPrompt[] = [];
      items.forEach((item) => {
        const prompt: GPTSystemPrompt = {
          id: item.id,
          created: new Date(item.created),
          prompt: item.prompt,
          currentlySelected: item.currentlySelected,
        };
        prompts.push(prompt);
      });

      return prompts;
    } else {
      console.log('no system prompts found');
      return null;
    }
  } catch (err) {
    console.log('no system prompts found');
    return null;
  }
}

export async function getCurrentSystemPrompt(): Promise<GPTSystemPrompt | null> {
  try {
    const params = new ScanCommand({
      TableName: 'full-circle-gpt-system-prompts',
      FilterExpression: 'currentlySelected = :value',
      ExpressionAttributeValues: {
        ':value': true,
      },
      // Limit: 1,
    });

    const response = await ddbDocClient.send(params);

    if (response.Items && response.Items.length > 0) {
      const item = response.Items[0];

      const systemPrompt: GPTSystemPrompt = {
        id: item.id,
        created: new Date(item.created),
        prompt: item.prompt,
        currentlySelected: true,
      };

      return systemPrompt;
    } else {
      console.log('no current system prompt found');
      return null;
    }
  } catch (err) {
    console.log('no current system prompt found');
    return null;
  }
}

export async function setCurrentPrompt(id: string) {
  // const ddbDocClient = DynamoDBDocumentClient.from(dbClient);
  const command = new UpdateCommand({
    TableName: 'full-circle-gpt-system-prompts',
    Key: {
      id: id,
    },
    UpdateExpression: 'set current = :val',
    ExpressionAttributeValues: {
      ':val': true,
    },
  });

  const response = await ddbDocClient.send(command);
  console.log(response);
}
export async function unsetCurrentPrompt() {
  // const ddbDocClient = DynamoDBDocumentClient.from(dbClient);
  const currentPrompt = await getCurrentSystemPrompt();
  if (currentPrompt) {
    const command = new UpdateCommand({
      TableName: 'full-circle-gpt-system-prompts',
      Key: {
        id: currentPrompt.id,
      },
      UpdateExpression: 'set current = :val',
      ExpressionAttributeValues: {
        ':val': false,
      },
    });

    const response = await ddbDocClient.send(command);
    console.log(response);
  }
}

export async function writeSystemPrompt(prompt: string) {
  const systemPrompt: GPTSystemPrompt = {
    id: uuidv4(),
    created: new Date(),
    prompt: prompt,
    currentlySelected: true,
  };

  //await unsetCurrentPrompt();

  const putCommand = new PutCommand({
    TableName: 'full-circle-gpt-system-prompts',
    Item: {
      id: systemPrompt.id,
      prompt: systemPrompt.prompt,
      created: systemPrompt.created.toISOString(),
      current: systemPrompt.currentlySelected,
    },
  });
  await ddbDocClient.send(putCommand);
  console.log('created new system prompt');

  // modify all other system prompts as current

  return systemPrompt;
}

export async function updatePrompt(prompt: GPTSystemPrompt) {
  const command = new UpdateCommand({
    TableName: 'full-circle-gpt-system-prompts',
    Key: {
      id: prompt.id,
    },
    UpdateExpression: 'set prompt = :val1, current = :val2',
    ExpressionAttributeValues: {
      ':val1': prompt.prompt,
      ':val2': prompt.currentlySelected,
    },
  });

  const response = await ddbDocClient.send(command);
  console.log(response);
}
