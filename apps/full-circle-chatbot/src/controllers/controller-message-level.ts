import {
  User,
  writeUser,
  createMessage,
  getMessages,
  Message,
  getCurrentGPTModel,
  getCurrentSystemPrompt,
  getBotMessage,
} from '@libs/dynamo-db';
import { gptChatResponse } from '@libs/gpt';
import { sendUserMessage } from '@libs/whats-app';
import {
  controllerExerciseRoute,
  evaluateStressLevel,
} from './controller-exercise-route';

export async function controllerMessageLevel(user: User, messageText: string) {
  let messageHistory: Message[] = null;
  let gptResponse: string = '';
  // Retrieve chat history
  messageHistory = await getMessages(user.id);

  // Check if same message is already in the database, could be we will receive the same request many times if an error occours inbetween
  const lastMessageThreshold = new Date(new Date().getTime() - 5 * 60 * 1000);
  if (
    messageHistory &&
    messageText === messageHistory[messageHistory.length - 1].userMessage && // Same message
    messageHistory[messageHistory.length - 1].created > lastMessageThreshold // Same message happened in the last 5min
  ) {
    console.error('Message has been previously sent to the server');
  } else {
    if (!messageHistory) {
      // Send initial onboarding message to user
      const initialMessage = await getBotMessage('onboording-message');
      if (initialMessage) {
        initialMessage.message = initialMessage.message.replace(
          '<Name>',
          user.firstname
        );
        sendUserMessage(user.phone, initialMessage.message);
      }
    }
    // Check if current GPT model exists
    const gptModel = await getCurrentGPTModel();
    const currentSystemPrompt = await getCurrentSystemPrompt();
    if (!gptModel || !currentSystemPrompt) {
      console.error('No GPT model or current System Prompt found');
    } else {
      // Check if user in exercise mode
      if (user.exerciseMode) {
        gptResponse = await controllerExerciseRoute(
          user,
          messageText,
          messageHistory,
          gptModel.id,
          currentSystemPrompt.prompt
        );
      } else {
        // Trigger GPT-model with chat history and user data
        gptResponse = await gptChatResponse(
          messageText,
          gptModel.id,
          currentSystemPrompt.prompt,
          user,
          messageHistory
        );
      }

      // Store new message Object in DB
      createMessage(user.id, messageText, gptResponse, gptModel.id);
      // Send message to user
      sendUserMessage(user.phone, gptResponse);

      if (!user.exerciseMode) {
        // run this in timely intervals, we don't need to evaluate stress level with every message
        const datePreviousTwoWeeks = new Date(
          new Date().getTime() - 14 * 24 * 60 * 60 * 1000
        );
        if (datePreviousTwoWeeks > user.exerciseLastParticipated) {
          await evaluateStressLevel(
            user,
            messageText,
            messageHistory,
            gptModel.id
          );
        }
      }
      // Update User in database
      writeUser(user);
    }
  }
}
