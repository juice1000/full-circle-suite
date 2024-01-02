import { useState, useEffect } from 'react';
import {
  getAllSystemPrompts,
  GPTSystemPrompt,
  updatePrompt,
  writeSystemPrompt,
  dbClient,
} from '@libs/dynamo-db';
import { classNames } from '../../utls';

const ControlPanel = () => {
  const [AIModel, setAIModel] = useState('');
  const [currentPrompt, setCurrentPrompt] = useState<GPTSystemPrompt>();
  const [promptInput, setPromptInput] = useState('');
  const [systemPrompts, setSystemPrompts] = useState<GPTSystemPrompt[]>([]);

  const saveSystemPrompt = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('saving');
    if (currentPrompt) {
      updatePrompt(currentPrompt);
      setCurrentPrompt(currentPrompt);
    } else {
      writeSystemPrompt(promptInput);
    }
  };
  useEffect(() => {
    console.log('dbClient:', dbClient);

    getAllSystemPrompts().then((prompts) => {
      console.log(prompts);
      if (prompts) {
        setSystemPrompts(prompts);
        const currentPrompt = prompts.find((prompt) => prompt.current);
        setCurrentPrompt(currentPrompt);
        setPromptInput(currentPrompt?.prompt || '');
      }
    });
  }, [currentPrompt]);
  return (
    <main>
      <h1 className="text-6xl font-bold">Control Panel</h1>

      <h1 className="mt-8 text-3xl font-bold">GPT System Prompt</h1>
      <form>
        <label
          htmlFor="client-name"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          System Prompt
        </label>
        <textarea
          name="prompt"
          rows={10}
          value={promptInput}
          className="input-box"
          onChange={(e) => setPromptInput(e.target.value)}
        />
        <button
          id="submit-button"
          className="btn mt-4"
          onClick={saveSystemPrompt}
        >
          Save
        </button>
      </form>
    </main>
  );
};

export default ControlPanel;
