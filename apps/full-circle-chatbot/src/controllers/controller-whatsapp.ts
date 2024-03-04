import { Request, Response } from 'express';
import { sendUserMessage, whatsAppRetreiveMessage } from '@libs/whats-app';

import { getUser } from '@libs/dynamo-db';
import { controllerMessageLevel } from './controller-message-level';
// import { deleteKey, findKey, writeKey } from '../io-redis';

export async function messageProcessor(req: Request, res: Response) {
  // Extract whats app user information
  const message = await whatsAppRetreiveMessage(req);

  if (message) {
    const phone = message.from;

    // Retrieve user profile
    const user = await getUser(phone);
    // return;
    if (!user) {
      // User not registered with the service yet
      // Send message to this phone number to sign up for services
      console.log('not a registered phone number: ', phone);
      sendUserMessage(
        phone,
        `Hi! It looks like you're not subscribed. Ria's ready to help! Support our impact enterprise at the cost of a coffee a month! Enjoy our limited early bird price of SGD4.97/month, renewed quarterly. Cancel anytime. Head to:  https://buy.stripe.com/bIY28W7LV6zw5S8bII`
      );
    } else if (
      user.subscriptionEndDate &&
      user.subscriptionEndDate < new Date()
    ) {
      // User subscription has expired
      // Send message to this phone number to refresh subscription
      console.log('subscription ended for: ', user.id);
      sendUserMessage(
        phone,
        `Hi ${user.firstname}! I've had a great time chatting with you. I hope I was helpful! Please help me fill out this 10 min survey form to let me know how I performed: https://forms.fillout.com/t/saBfNyMmMtus`
      );
    } else if (message.type !== 'text') {
      sendUserMessage(
        phone,
        `Sorry, I can't receive images or voice messages yet - but I will be able to one day! Send me a text message instead?`
      );
    } else if (message.text.body && message.text.body.length > 1000) {
      sendUserMessage(
        phone,
        `Sorry, I'd love to hear from you but could you shorten that message to less than 200 words? Thank you!`
      );
    } else {
      const messageText = message.text.body;
      // debouncing message input
      // const id = user.id;
      // let redisData = await findKey(id);
      // if (redisData) {
      //   redisData.messages += `\n${messageText}`;
      //   redisData.lastMessage = new Date();
      // } else {
      //   redisData = { messages: messageText, lastMessage: new Date() };
      // }
      // await writeKey(id, redisData);
      // setTimeout(async () => {
      //   redisData = await findKey(id);
      //   if (
      //     redisData &&
      //     redisData.lastMessage.getTime() < new Date().getTime() - 3999
      //   ) {
      //     console.log(
      //       `debouncing messages done, let's start!`,
      //       redisData.messages
      //     );
      //     deleteKey(id);
      //     controllerMessageLevel(user, redisData.messages);
      //   }
      // }, 4000);
      controllerMessageLevel(user, messageText);
    }

    // What's App message received
    res.sendStatus(200);
  } else {
    // What's App message not received
    res.sendStatus(400);
  }
}
