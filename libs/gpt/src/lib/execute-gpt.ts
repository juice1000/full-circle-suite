import OpenAI from 'openai';

export async function executeGPTModel(
  messages: any,
  openaiClient: OpenAI,
  prompt: string
): Promise<string> {
  try {
    console.log('\nCalling executeGPTModel\n');
    const gptModel: string = process.env.GPT_MODEL || '';
    // This is new user prompt
    const userPrompt = {
      role: 'user',
      content: prompt,
    };
    messages.push(userPrompt);

    const completionsObject = {
      messages: messages as OpenAI.ChatCompletionMessageParam[],
      model: gptModel,
      n: 1,
    };

    // Calling the openai API
    const completion = await openaiClient.chat.completions.create(
      completionsObject
    );

    // console.log(completion.choices[0].message.content);
    if (completion.choices[0].message.content) {
      return completion.choices[0].message.content;
    } else {
      return 'An unexpected error occured, the chatbot AI could not respond';
    }
  } catch (err) {
    return 'An unexpected error occured, the chatbot AI could not respond';
  }
}
