import { Request, Response } from 'express';
import { sendUserMessage, whatsAppRetreiveMessage } from '@libs/whats-app';

import { getUser } from '@libs/dynamo-db';
import { controllerMessageLevel } from './controllers/controller-message-level';

export async function messageProcessor(req: Request, res: Response) {
  // Extract whats app user information
  const message = await whatsAppRetreiveMessage(req, res);

  // TODO: trottling messages in Redis database

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
      res.sendStatus(200);
    } else {
      controllerMessageLevel(user, messageText, res);
    }
  } else {
    res.sendStatus(400);
  }
}
