import { Message, User, getExercise } from '@libs/dynamo-db';
import {
  gptChatResponse,
  gptExerciseResponse,
  interpretStressLevel,
} from '@libs/gpt';
import { sendUserMessage } from '@libs/whats-app';

export async function controllerExerciseRoute(
  user: User,
  messageText: string,
  messageHistory: Message[]
): Promise<string> {
  // Check when the last exercise has been
  let gptResponse = '';
  const datePreviousTwoWeeks = new Date(
    new Date().getTime() - 14 * 24 * 60 * 60 * 1000
  );
  const exercise = await getExercise(user.exerciseName);
  // Safety checks if we really need to run the exercise
  if (
    user.exerciseStep < exercise.steps &&
    user.exerciseLastParticipated < datePreviousTwoWeeks
  ) {
    gptResponse = await gptExerciseResponse(
      messageText,
      messageHistory,
      user,
      exercise
    );
    user.exerciseStep += 1;
  } else {
    console.log('not in exercise mode anymore');

    user.exerciseMode = false;
    user.exerciseName = '';
    user.exerciseStep = 0;
    user.exerciseLastParticipated = new Date();
    gptResponse = await gptChatResponse(messageText, messageHistory, user);
  }

  return gptResponse;
}

export async function evaluateStressLevel(
  user: User,
  messageText: string,
  messageHistory: Message[]
) {
  // Elaborate on the stress level
  await interpretStressLevel(user, messageText, messageHistory);
  console.log('user stress score: ', user.stressScore);

  // We check if the last exercise has been
  const datePreviousTwoWeeks = new Date(
    new Date().getTime() - 14 * 24 * 60 * 60 * 1000
  );
  if (
    user.stressScore < -0.5 &&
    user.exerciseLastParticipated < datePreviousTwoWeeks
  ) {
    // Initiate stress exercise
    user.exerciseMode = true;
    user.exerciseName = 'mental-distress'; // TODO: this exercise should not be hardcoded
    user.exerciseStep = 1; // Always starts at 1, because we automatically trigger the first exercise question
    const exercise = await getExercise(user.exerciseName);
    sendUserMessage(user.phone, exercise.questions[0]);
  }
}
