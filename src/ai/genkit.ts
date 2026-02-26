
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [
    googleAI(),
  ],
  model: 'googleai/gemini-2.0-flash-exp', // Modelo de última geração solicitado
});
