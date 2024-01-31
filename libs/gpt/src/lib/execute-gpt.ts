import OpenAI from 'openai';

export async function executeGPTModel(
  messages: any,
  openaiClient: OpenAI,
  prompt: string,
  gptModelId: string
): Promise<string> {
  try {
    // console.log('\nCalling executeGPTModel\n');
    // This is new user prompt
    const userPrompt = {
      role: 'user',
      content: prompt,
    };
    messages.push(userPrompt);

    const completionsObject = {
      messages: messages as OpenAI.ChatCompletionMessageParam[],
      model: gptModelId,
      n: 1,
    };

    // Calling the openai API
    const completion = await openaiClient.chat.completions.create(
      completionsObject
    );

    // console.log(completion.choices[0].message.content);
    if (completion.choices[0].message.content) {
      console.log(completion.choices[0].message.content);
      return completion.choices[0].message.content;
    } else {
      console.error('error generating response from GPT3, no response found');
      return 'An unexpected error occured, the chatbot AI could not respond';
    }
  } catch (err) {
    console.error('error generating response from GPT3', err);

    return 'An unexpected error occured, the chatbot AI could not respond';
  }
}
