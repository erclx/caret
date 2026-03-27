import type { Prompt } from '@/shared/types'

export const SEED_PROMPTS: Prompt[] = [
  {
    id: crypto.randomUUID(),
    name: 'summarize',
    label: 'claude',
    body: 'Summarize this in three bullet points.',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: crypto.randomUUID(),
    name: 'explain-code',
    label: 'claude',
    body: 'Explain this code in simple terms. No jargon.',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: crypto.randomUUID(),
    name: 'draft-email',
    label: 'writing',
    body: 'Draft a professional email based on the following notes:',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: crypto.randomUUID(),
    name: 'simplify',
    label: 'writing',
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
