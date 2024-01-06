import { ddbDocClient } from './dynamo-db';
// import { PutItemCommand, ScanCommand } from '@aws-sdk/client-dynamodb';
import { ScanCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

import { GuidedExercise } from './db-types';

export async function getExercise(
  name: string
): Promise<GuidedExercise | null> {
  try {
    const params = new ScanCommand({
      TableName: 'full-circle-guided-exercises',
      FilterExpression: 'exerciseName = :value',
      ExpressionAttributeValues: {
        ':value': name,
      },
      Limit: 1,
    });

    //   const command = new GetItemCommand(params);
    const response = await ddbDocClient.send(params);

    if (response.Items && response.Items.length > 0) {
      const item = response.Items[0];

      const exercise: GuidedExercise = {
        id: item.id,
        created: new Date(item.created),
        exerciseName: item.exerciseName,
        steps: item.steps,
        questions: item.questions,
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

export async function writeExercise(
  name: string,
  steps: number,
  questions: string[]
) {
  const exercise: GuidedExercise = {
    id: uuidv4(),
    exerciseName: name,
    created: new Date(),
    steps: steps,
    questions: questions,
  };

  const putCommand = new PutCommand({
    TableName: 'full-circle-guided-exercises',
    Item: { ...exercise, created: exercise.created.toISOString() },
  });
  await ddbDocClient.send(putCommand);
  console.log('created new exercise');

  return exercise;
}

export async function createExercise(
  name: string,
  steps: number,
  questions: string[]
) {
  const existingUser = await getExercise(name);
  if (!existingUser) {
    writeExercise(name, steps, questions);
  } else {
    // TODO: report feedback to signing up user that phone number has already been taken
    console.error('Exercise already exists');
  }
}
