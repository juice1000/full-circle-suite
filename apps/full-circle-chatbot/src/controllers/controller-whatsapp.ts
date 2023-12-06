import { Request, Response } from 'express';
import { sendUserMessage, whatsAppRetreiveMessage } from '@libs/whats-app';

import { getUser } from '@libs/dynamo-db';
import { controllerMessageLevel } from './controller-message-level';

const debounceObj = {};

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
      if (debounceObj[`${id}`]) {
        debounceObj[`${id}`].text += `\n${messageText}`;
        debounceObj[`${id}`].lastAdded = new Date();
      } else {
        debounceObj[`${id}`] = { text: messageText, lastAdded: new Date() };
      }
      const inter = setInterval(() => {
        if (
          debounceObj[`${id}`].lastAdded <
          new Date(new Date().getTime() - 3 * 1000)
        ) {
          console.log('we can start!');
          clearInterval(inter);
          //controllerMessageLevel(user, messageText, res);
        }
        // console.log(debounceObj[`${id}`]);
      }, 1000);
    }

    // Message received
    res.sendStatus(200);
  } else {
    // Message not received
    res.sendStatus(400);
  }
}
