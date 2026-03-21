import type { Prompt } from '@/shared/types'

export const SEED_PROMPTS: Prompt[] = [
  {
    id: crypto.randomUUID(),
    name: 'summarize',
    body: 'Summarize this in three bullet points.',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: crypto.randomUUID(),
    name: 'simplify',
    body: 'Rewrite this in plain language. No jargon.',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: crypto.randomUUID(),
    name: 'proofread',
    body: 'Proofread this. Fix grammar, spelling, and clarity.',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
]
