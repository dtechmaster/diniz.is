import { reactive } from 'vue'
import type { GameState, Emotion, Personality, CoinAmount } from './types'

// #region Game Store (bridge between Phaser and Vue)

export const gameStore = reactive({
  state: 'idle' as GameState,
  emotion: 'thinking' as Emotion,
  npcText: '',
  personality: 'shy' as Personality,
  playerText: '',
  npcName: '',
  coins: 0,
  lastCoins: 0 as CoinAmount,
})

// #endregion
