import { faker } from '@faker-js/faker/locale/ja'
import type { Personality } from './types'

// #region Config

export const NPC_COUNT = 20

export interface NPCConfig {
  name: string
  personality: Personality
}

// #endregion

// #region Factory

const PERSONALITIES: Personality[] = ['shy', 'tsundere', 'playful', 'cold']

export function generateNPCConfigs(count = NPC_COUNT): NPCConfig[] {
  return Array.from({ length: count }, () => ({
    name: faker.person.firstName(),
    personality: PERSONALITIES[Math.floor(Math.random() * PERSONALITIES.length)],
  }))
}

// #endregion
