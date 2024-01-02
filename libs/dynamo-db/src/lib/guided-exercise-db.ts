import { dbClient } from './dynamo-db';
import { PutItemCommand, ScanCommand } from '@aws-sdk/client-dynamodb';
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
        ':value': { S: name },
      },
      Limit: 1,
    });

    //   const command = new GetItemCommand(params);
    const response = await dbClient.send(params);

    if (response.Items && response.Items.length > 0) {
      const item = response.Items[0];

      const exercise: GuidedExercise = {
        id: item.id.S,
        created: new Date(Number(item.created.N)),
        exerciseName: item.exerciseName.S,
        steps: Number(item.steps.N),
        questions: item.questions.L.map((question) => question.S),
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

  const putCommand = new PutItemCommand({
    TableName: 'full-circle-guided-exercises',
    Item: {
      id: { S: exercise.id },
      exerciseName: { S: exercise.exerciseName },
      created: { N: `${exercise.created.getTime()}` },
      steps: { N: `${exercise.steps}` },
      questions: {
        L: exercise.questions.map((question) => {
          return { S: question };
        }),
      },
    },
  });
  await dbClient.send(putCommand);
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
