import { dbClient } from './dynamo-db';
import { PutItemCommand } from '@aws-sdk/client-dynamodb';
import { v4 as uuidv4 } from 'uuid';

import { GuidedExercise } from './db-types';

export async function getExercise(
  name: string
): Promise<GuidedExercise | null> {
  try {
    const params = {
      TableName: 'full-circle-guided-exercises',
      FilterExpression: 'name = :value',
      ExpressionAttributeValues: {
        ':value': { S: name },
      },
      Limit: 1,
    };
    //   const command = new GetItemCommand(params);
    const response = await dbClient.scan(params);

    if (response.Items && response.Items.length > 0) {
      const item = response.Items[0];
      const exercise: GuidedExercise = {
        id: item.id.S,
        created: new Date(Number(item.created.N)),
        name: item.name.S,
        steps: Number(item.steps.N),
        questions: item.questions.SS,
      };

      return exercise;
    } else {
      console.log('no exercise found');
      return null;
    }
  } catch (err) {
    console.log('no exercise found');
    return null;
  }
}

export async function createExercise(
  name: string,
  steps: number,
  questions: string[]
) {
  const exercise: GuidedExercise = {
    id: uuidv4(),
    name: name,
    created: new Date(),
    steps: steps,
    questions: questions,
  };
  const putCommand = new PutItemCommand({
    TableName: 'full-circle-guided-exercises',
    Item: {
      id: { S: exercise.id },
      name: { S: exercise.name },
      created: { N: `${exercise.created.getTime()}` },
      steps: { N: `${exercise.steps}` },
      questions: { SS: exercise.questions },
    },
  });
  await dbClient.send(putCommand);
  console.log('created new message');

  return exercise;
}
