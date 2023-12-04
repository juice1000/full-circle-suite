import { Request, Response } from 'express';
import {
  sendMessage,
  sendUserMessage,
  whatsAppRetreiveMessage,
} from '@libs/whats-app';
import { gptChatResponse, interpretStressLevel } from '@libs/gpt';
import {
  getUser,
  createUser,
  writeUser,
  createMessage,
  getMessages,
  Message,
} from '@libs/dynamo-db';

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
      // Check if user in exercise mode
      if (user.exerciseMode) {
        const gptResonse = await gptChatResponse(messageText);
      } else {
        // Retrieve chat history
        messageHistory = await getMessages(user.id);
        // Trigger GPT-model with chat history and user data
        gptResponse = await gptChatResponse(messageText, messageHistory, user);
      }
    }

    // Store new message Object in DB
    createMessage(user.id, messageText, gptResponse);
    // Send message to user
    sendUserMessage(phone, gptResponse);
    // Elaborate on the stress level
    await interpretStressLevel(user, messageText, messageHistory);
    // Update User in database
    writeUser(user);

    if (user.stressScore < -0.5) {
      // Run stress exercise
      user.exerciseMode = true;
      user.exerciseName = 'mental-distress';
      user.exerciseStep = 0;

      const message = `I understand you've been facing challenges with your baby's sleep. Can you share more about what specifically has been happening?`;
      sendUserMessage(phone, message);
    }

    res.sendStatus(200);
  } else {
    res.sendStatus(400);
  }
}
