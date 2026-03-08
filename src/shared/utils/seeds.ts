import type { Prompt } from '@/shared/types'

export const SEED_PROMPTS: Prompt[] = [
  {
    id: crypto.randomUUID(),
    name: 'summarize',
    body: 'Summarize the following text into 3 concise bullet points.',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: crypto.randomUUID(),
    name: 'refactor',
    body: 'Refactor the following code to improve readability and maintainability without altering its behavior.',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: crypto.randomUUID(),
    name: 'explain',
    body: 'Explain this concept using simple terms as if talking to a high school student.',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
]
