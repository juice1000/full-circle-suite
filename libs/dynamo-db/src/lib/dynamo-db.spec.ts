import { dynamoDb } from './dynamo-db';

describe('dynamoDb', () => {
  it('should work', () => {
    expect(dynamoDb()).toEqual('dynamo-db');
  });
});
