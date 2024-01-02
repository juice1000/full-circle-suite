import { dbClient, ddbDocClient } from './dynamo-db';
import { PutItemCommand } from '@aws-sdk/client-dynamodb';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

import { User } from './db-types';

const tableName = 'full-circle-users';
export async function getUser(phone: string): Promise<User | null> {
  try {
    const params = new ScanCommand({
      TableName: tableName,
      FilterExpression: 'phone = :value',
      ExpressionAttributeValues: {
        ':value': phone, // Use the appropriate data type (S for String, N for Number, etc.)
      },
    });
    //   const command = new GetItemCommand(params);
    const response = await ddbDocClient.send(params);
    console.log(response);

    if (response.Items && response.Items.length > 0) {
      const item = response.Items[0];
      // console.log(item);

      const user: User = {
        id: item.id,
        created: new Date(item.created),
        firstname: item.firstname,
        lastname: item.lastname,
        birthdate: new Date(item.birthdate),
        phone: item.phone,
        stressScore: item.stressScore,
        email: item.email,
        numberOfChildren: item.numberOfChildren,
        introduction: item.introduction,
        exerciseMode: item.exerciseMode,
        exerciseName: item.exerciseName,
        exerciseStep: item.exerciseStep,
        exerciseLastParticipated: new Date(item.exerciseLastParticipated),
        subscriptionStartDate: new Date(item.subscriptionStartDate),
        subscriptionEndDate: new Date(item.subscriptionEndDate),
      };
      // console.log(user);

      return user;
    } else {
      console.log('no user found');
      return null;
    }
  } catch (err) {
    console.log('error retrieving user', err);
    return null;
  }
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
    exerciseLastParticipated: userInfo.exerciseLastParticipated,
    subscriptionStartDate: userInfo.subscriptionStartDate,
    subscriptionEndDate: userInfo.subscriptionEndDate,
  };
  const putCommand = new PutItemCommand({
    TableName: tableName,
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
      exerciseLastParticipated: {
        N: `${user.exerciseLastParticipated.getTime()}`,
      },
      subscriptionStartDate: { N: `${user.subscriptionStartDate.getTime()}` },
      subscriptionEndDate: user.subscriptionEndDate
        ? {
            N: `${user.subscriptionEndDate.getTime()}`,
          }
        : { NULL: true },
    },
  });
  await dbClient.send(putCommand);
  console.log('written user');

  return user;
}

export async function createUser(userInfo: any) {
  const existingUser = await getUser(userInfo.phone);
  if (!existingUser) {
    writeUser(userInfo);
  } else {
    // TODO: report feedback to signing up user that phone number has already been taken
    console.error('User already exists');
  }
}
