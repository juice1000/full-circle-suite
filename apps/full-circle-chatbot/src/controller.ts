import { Request, Response } from 'express';
import { whatsAppRetreiveMessage } from '@libs/whats-app';
import { gptChatResponse } from '@libs/gpt';
import { getUser, createUser } from '@libs/dynamo-db';

import axios from 'axios';

export async function whatsAppWebhook(req: Request, res: Response) {
  const message = await whatsAppRetreiveMessage(req, res);

  if (message) {
    const phone = message.from;
    const messageText = message.text.body;

    // Retrieve user profile
    let user = await getUser(phone);
    if (!user) {
      // Create new user if doesn't exist
      user = await createUser(phone);
    }
    // Trigger GPT-model
    const gptResponse = await gptChatResponse(messageText);

    // Store new message Object in DB

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
    res.sendStatus(200);
  } else {
    res.sendStatus(400);
  }
}
