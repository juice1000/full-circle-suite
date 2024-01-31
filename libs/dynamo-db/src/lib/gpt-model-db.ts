import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import { GPTModel } from './db-types';
import { ddbDocClient } from './dynamo-db';

export async function getCurrentGPTModel(): Promise<GPTModel | null> {
  try {
    const params = new ScanCommand({
      TableName: 'full-circle-gpt-models',
      FilterExpression: 'currentlySelected = :value',
      ExpressionAttributeValues: {
        ':value': true,
      },
    });

    const response = await ddbDocClient.send(params);

    if (response.Items && response.Items.length > 0) {
      const item = response.Items[0];

      const gptModel: GPTModel = {
        id: item.id,
        current: true,
      };

      return gptModel;
    } else {
      console.log('no current gpt model found');
      return null;
    }
  } catch (err) {
    console.log('no current gpt model found', err);
    return null;
  }
}
