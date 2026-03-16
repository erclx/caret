import { z } from 'zod'

export const PromptSchema = z.object({
  id: z.string(),
  name: z.string(),
  body: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
  source: z.literal('github').optional(),
})

export type Prompt = z.infer<typeof PromptSchema>

export const SiteSettingsSchema = z.object({
  triggerSymbol: z.string().default('>'),
  enabled: z.boolean().default(true),
})

export const GithubSettingsSchema = z.object({
  pat: z.string(),
  owner: z.string(),
  repo: z.string(),
  branch: z.string().default('main'),
  snippetsPath: z.string().default('snippets'),
  lastSyncedAt: z.number().optional(),
  lastSyncedCount: z.number().optional(),
  connectionHealth: z.enum(['connected', 'error']).optional(),
})

export type GithubSettings = z.infer<typeof GithubSettingsSchema>

export const SettingsSchema = z.object({
  sites: z.record(z.string(), SiteSettingsSchema).default({}),
  github: GithubSettingsSchema.optional(),
})

export type Settings = z.infer<typeof SettingsSchema>
