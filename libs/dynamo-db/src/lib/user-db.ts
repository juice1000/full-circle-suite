import { ddbDocClient } from './dynamo-db';
import { ScanCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

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

    if (response.Items && response.Items.length > 0) {
      const item = response.Items[0];

      const user: User = {
        id: item.id,
        created: new Date(item.created),
        firstname: item.firstname,
        lastname: item.lastname,
        birthdate: new Date(item.birthdate),
        role: item.role,
        archeType: item.archeType,
        parentingConcerns: item.parentingConcerns,
        children: JSON.parse(item.children),
        phone: item.phone,
        stressScore: item.stressScore,
        email: item.email,
        numberOfChildren: item.numberOfChildren,
        introduction: item.introduction,
        initialIntroduction: item.initialIntroduction,
        exerciseMode: item.exerciseMode,
        exerciseName: item.exerciseName,
        exerciseStep: item.exerciseStep,
        exerciseLastParticipated: new Date(item.exerciseLastParticipated),
        subscriptionStartDate: new Date(item.subscriptionStartDate),
        subscriptionEndDate: item.subscriptionEndDate
          ? new Date(item.subscriptionEndDate)
          : null,
      };

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

export async function writeUser(user: User) {
  // convert dates to iso strings
  const convertedUser = {
    ...user,
    created: user.created.toISOString(),
    birthdate: user.birthdate ? user.birthdate.toISOString() : null,
    exerciseLastParticipated: user.exerciseLastParticipated.toISOString(),
    subscriptionStartDate: user.subscriptionStartDate.toISOString(),
    subscriptionEndDate: user.subscriptionEndDate
      ? user.subscriptionEndDate.toISOString()
      : null,
    children: JSON.stringify(user.children),
  };

  const putCommand = new PutCommand({
    TableName: tableName,
    Item: convertedUser,
  });
  await ddbDocClient.send(putCommand);
  console.log('written user');

  return user;
}

export async function createUser(userInfo: User) {
  const existingUser = await getUser(userInfo.phone);
  if (!existingUser) {
    writeUser(userInfo);
  } else {
    // TODO: report feedback to signing up user that phone number has already been taken
    console.error('User already exists');
  }
}
