import { Request, Response } from 'express';
import { whatsAppRetreiveMessage } from '@libs/whats-app';
import { gptChatResponse, interpretStressLevel } from '@libs/gpt';
import {
  getUser,
  createUser,
  writeUser,
  createMessage,
  getMessages,
  Message,
} from '@libs/dynamo-db';

import axios from 'axios';

export async function whatsAppWebhook(req: Request, res: Response) {
  // Extract whats app user information
  const message = await whatsAppRetreiveMessage(req, res);

  if (message) {
    const phone = message.from;
    const messageText = message.text.body;

    // Retrieve user profile
    let user = await getUser(phone);
    let messageHistory: Message[] = null;
    let gptResponse: string = '';

    if (!user) {
      // Create new user if doesn't exist
      user = await createUser(phone);
      // Trigger GPT-model
      gptResponse = await gptChatResponse(messageText);
    } else {
      // Retrieve chat history
      messageHistory = await getMessages(user.id);
      // Trigger GPT-model with chat history and user data
      gptResponse = await gptChatResponse(messageText, messageHistory, user);
    }

    // Store new message Object in DB
    createMessage(user.id, messageText, gptResponse);

    // Fire axios response here
    const messageBody = {
      messaging_product: 'whatsapp',
      to: phone,
      text: {
        body: gptResponse,
      },
    };

    axios.post(
      'https://graph.facebook.com/v17.0/189035427616900/messages',
      messageBody,
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Elaborate on the stress level
    await interpretStressLevel(user, messageText, messageHistory);
    // Update User in database
    writeUser(user);

    res.sendStatus(200);
  } else {
    res.sendStatus(400);
  }
}
