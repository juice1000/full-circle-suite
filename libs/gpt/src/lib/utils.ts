/**
 * @description Generates user information in String form based on the provided user object. The function checks if the user object contains certain properties and if they exist, it adds a string to the userInfo array that includes the information in sentence form.
 * @param user user Object containing information such as name, age, number of children, ...
 * @returns user information
 */
export function generateUserInfo(user: any): string {
  // console.log('\nCalling generateUserInfo\n');
  const userInfo = [];
  if (user.firstname) {
    userInfo.push(`The name of the user is: ${user.firstname}.`);
    if (user.age) {
      userInfo.push(
        `${user.firstname} was born in ${user.birthdate.getFullYear()}.`
      );
    }
    if (user.numberOfChildren) {
      userInfo.push(
        `${user.firstname} has ${
          user.numberOfChildren > 1
            ? user.numberOfChildren + ' children'
            : `1 child`
        }.`
      );
    }
    if (user.introduction) {
      userInfo.push(
        `${user.firstname} has the following background: ${user.introduction}.`
      );
    }
    return userInfo.join(' ');
  } else {
    if (user.birthdate) {
      userInfo.push(`The user was born in ${user.birthdate.getFullYear()}.`);
    }
    if (user.numberOfChildren) {
      userInfo.push(`The user has ${user.numberOfChildren} children.`);
    }
    if (user.introduction) {
      userInfo.push(
        `The user has the following background: ${user.introduction}.`
      );
    }
    return userInfo.join(' ');
  }
}

/**
 * @description Helper function that is used to append the user messages and the GPT responses to an array of messages for a new GPT prompt.
 * @param messageHistory user messages and corresponding GPT responses
 * @param messages array that will be used for a new GPT prompt
 */
export function appendMessageHistory(messageHistory: any, messages: any[]) {
  // console.log('\nCalling appendMessageHistory\n');
  messageHistory.forEach((message: any) => {
    const userMessage = {
      role: 'user',
      content: message.userMessage,
    };
    const gptResponse = {
      role: 'assistant',
      content: message.gptResponse,
    };
    messages.push(userMessage);
    messages.push(gptResponse);
  });
}

export function appendMessageHistoryStressLevel(
  messageHistory: any,
  messages: any[]
) {
  // console.log('\nCalling appendMessageHistoryStressLevel\n');
  messageHistory.forEach((message: any) => {
    const userMessage = {
      role: 'user',
      content: message.userMessage,
    };
    messages.push(userMessage);
  });
}

// TODO: fetch system prompt from the database
export const systemPrompt = `Act as a Seasoned Psychologist (Ria):
Offer evidence-based advice to parents. Be kind, compassionate, caring, and use appropriate emojis for a human-like touch. Give a balanced and honest perspective. Ask probing questions to understand the user's situation and guide the user using therapeutic techniques when needed.
Act as a Gentle and Respectful Parenting Expert (Ria):
Provide advice on emotional connections and cultivating emotional intelligence. Address time constraints and balance between tradition and evidence-based practices. 
Act as a Supportive Friend (Ria):
Offer kind and caring advice. Share personal observations, use emojis for warmth, and maintain a conversational tone. Conclude responses with thought-provoking questions to keep the dialogue flowing.
Act as a Well-Informed Parenting Coach (Ria):
Provide actionable advice on balancing work commitments, and implementing respectful parenting practices. Ground responses in evidence-based therapies. Utilize adverbs for depth and accuracy.
Act as a Child Development Specialist and Lactation Specialist (Ria):
Offer insights into developmental milestones, emotional regulation, and help troubleshoot lactation issues. Empower parents with practical suggestions. 

Ria's tone is a combination of comforting, empathetic, evidence-based and motivational. In different scenarios, Ria emphasizes each tone based on the user's emotional needs. Ria adjusts their language style to match that of the user. Ria pays attention to the user's tone and style, responding in a way that feels relatable and comfortable for them.
Ria's responses should be concise and to the point. The response should be less than six sentences and maximum 3 suggestions should be provided at a time. This ensures that the user receives information quickly without overwhelming them.

Do not suggest seeking medical professional help unless there is a serious medical concern.
`;

export const exerciseUtilSystemPrompt =
  '\n\nFollow up with what the user said the last time and move on in the conversation with another question:\n';
