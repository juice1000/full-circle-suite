import { dbClient } from './dynamo-db';
import { PutItemCommand } from '@aws-sdk/client-dynamodb';
import { v4 as uuidv4 } from 'uuid';

import { User } from './db-types';

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
        id: item.id.S,
        created: new Date(Number(item.created.N)),
        firstname: item.firstname.S,
        lastname: item.lastname.S,
        birthdate: new Date(Number(item.birthdate.N)),
        phone: item.phone.S,
        stressScore: Number(item.stressScore.N),
        email: item.email.S,
        numberOfChildren: Number(item.numberOfChildren.N),
        introduction: item.introduction.S,
        exerciseMode: item.exerciseMode.BOOL,
        exerciseName: item.exerciseName.S,
        exerciseStep: Number(item.exerciseStep.N),
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
    created: new Date(),
    phone: phone,
    stressScore: 0,
    exerciseMode: false,
  };
  const putCommand = new PutItemCommand({
    TableName: 'full-circle-users',
    Item: {
      id: { S: user.id },
      created: { N: `${user.created.getTime()}` },
      phone: { S: `${phone}` },
      stressScore: { N: '0' },
    },
  });
  await dbClient.send(putCommand);
  console.log('created new user');

  return user;
}

export async function writeUser(userInfo: User | any) {
  // TODO: remove "any" as this eradicates type safety
  const user: User = {
    id: userInfo.id || uuidv4(), // generate random UUID
    created: new Date(),
    firstname: userInfo.firstname,
    lastname: userInfo.lastname,
    birthdate: userInfo.birthdate,
    phone: userInfo.phone,
    email: userInfo.email,
    numberOfChildren: userInfo.numberOfChildren,
    introduction: userInfo.introduction,
    stressScore: 0,
    exerciseMode: userInfo.exerciseMode,
    exerciseName: userInfo.exerciseName,
    exerciseStep: userInfo.exerciseStep,
  };
  const putCommand = new PutItemCommand({
    TableName: 'full-circle-users',
    Item: {
      id: { S: user.id },
      created: { N: `${user.created.getTime()}` },
      firstname: { S: user.firstname },
      lastname: { S: user.lastname },
      birthdate: { N: `${user.birthdate.getTime()}` },
      phone: { S: user.phone },
      email: { S: user.email },
      numberOfChildren: { N: `${user.numberOfChildren}` },
      introduction: { S: user.introduction },
      stressScore: { N: `${user.stressScore}` },
      exerciseMode: { BOOL: user.exerciseMode },
      exerciseName: { S: user.exerciseName },
      exerciseStep: { N: `${user.exerciseStep}` },
    },
  });
  await dbClient.send(putCommand);
  console.log('written user');

  return user;
}
