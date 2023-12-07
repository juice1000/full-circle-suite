import { Request, Response } from 'express';
import { sendUserMessage, whatsAppRetreiveMessage } from '@libs/whats-app';

import { getUser } from '@libs/dynamo-db';
import { controllerMessageLevel } from './controller-message-level';
import { deleteKey, findKey, writeKey } from '../io-redis';

export async function messageProcessor(req: Request, res: Response) {
  // Extract whats app user information
  const message = await whatsAppRetreiveMessage(req);

  if (message) {
    const phone = message.from;
    const messageText = message.text.body;

    // Retrieve user profile
    const user = await getUser(phone);

    if (!user) {
      // User not registered with the service yet
      // Send message to this phone number to sign up for services
      console.log('not a registered phone number: ', phone);
      sendUserMessage(
        phone,
        'Hello, you seem to be not registered with our service. Please sign up at https://www.fullcircle.family/ or contact us at hello@fullcircle.family in case you are facing issues with our service.'
      );
    } else {
      // debouncing message input
      const id = user.id;
      let redisData = await findKey(id);

      if (redisData) {
        redisData.messages += `\n${messageText}`;
        redisData.lastMessage = new Date();
      } else {
        redisData = { messages: messageText, lastMessage: new Date() };
      }

      await writeKey(id, redisData);

      setTimeout(async () => {
        redisData = await findKey(id);
        if (
          redisData &&
          redisData.lastMessage.getTime() < new Date().getTime() - 3 * 1000
        ) {
          console.log(
            `debouncing messages done, let's start!`,
            redisData.messages
          );
          deleteKey(id);
          console.log();
          controllerMessageLevel(user, messageText);
        }
      }, 3000);
    }

    // What's App message received
    res.sendStatus(200);
  } else {
    // What's App message not received
    res.sendStatus(400);
  }
}
