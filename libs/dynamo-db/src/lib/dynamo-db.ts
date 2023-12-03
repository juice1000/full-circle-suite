import {
  DynamoDB,
  CreateTableCommand,
  CreateTableCommandInput,
  DeleteTableCommand,
} from '@aws-sdk/client-dynamodb';
import {
  messageSchema,
  userSchema,
  gptSystemPromptSchema,
  selectedTrainingDataSchema,
} from './table-schemas';

let dbClient: DynamoDB;
async function createTable(
  dbClient: DynamoDB,
  input: CreateTableCommandInput,
  name: string
) {
  try {
    const command = new CreateTableCommand(input);
    await dbClient.send(command);
    console.log('successfully created: ', name);
  } catch (err) {
    console.error(err);
  }
}

async function deleteTable(tableName: string) {
  const command = new DeleteTableCommand({
    TableName: tableName,
  });
  await dbClient.send(command);
  console.log('successfully deleted: ', tableName);
}

export async function initializeDB() {
  if (!dbClient) {
    dbClient = new DynamoDB({ region: process.env.AWS_REGION_EU_NORTH });
  }
  try {
    const results = await dbClient.listTables({});
    //console.log('available tables in DynamoDB:\n', results.TableNames);
    if (results.TableNames) {
      if (!results.TableNames.includes('full-circle-messages')) {
        await createTable(dbClient, messageSchema, 'full-circle-messages');
      }
      if (!results.TableNames.includes('full-circle-users')) {
        await createTable(dbClient, userSchema, 'full-circle-users');
      }
      if (!results.TableNames.includes('full-circle-gpt-system-prompts')) {
        await createTable(
          dbClient,
          gptSystemPromptSchema,
          'full-circle-gpt-system-prompts'
        );
      }
      if (!results.TableNames.includes('full-circle-selected-training-data')) {
        await createTable(
          dbClient,
          selectedTrainingDataSchema,
          'full-circle-selected-training-data'
        );
      }
    }

    return;
  } catch (err) {
    console.error(err);
  }
}

export async function deleteTables() {
  try {
    if (!dbClient) {
      dbClient = new DynamoDB({ region: process.env.AWS_REGION_EU_NORTH });
    }
    const results = await dbClient.listTables({});
    //console.log('available tables in DynamoDB:\n', results.TableNames);
    if (results.TableNames) {
      if (results.TableNames.includes('full-circle-messages')) {
        await deleteTable('full-circle-messages');
      }
      if (results.TableNames.includes('full-circle-users')) {
        await deleteTable('full-circle-users');
      }
      if (results.TableNames.includes('full-circle-gpt-system-prompts')) {
        await deleteTable('full-circle-gpt-system-prompts');
      }
      if (results.TableNames.includes('full-circle-selected-training-data')) {
        await deleteTable('full-circle-selected-training-data');
      }
    }
  } catch (err) {
    console.error(err);
  }
}

export { dbClient };