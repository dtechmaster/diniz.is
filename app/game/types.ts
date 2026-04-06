// #region Types

export type GameState =
  | 'idle'
  | 'near_npc'
  | 'interacting'
  | 'waiting_llm'
  | 'npc_question'
  | 'npc_verdict'

export type Emotion = 'thinking' | 'happy' | 'sad' | 'angry' | 'bored' | 'cheerleading' | 'cheers'

export type Personality = 'shy' | 'tsundere' | 'playful' | 'cold'

export type CoinAmount = 0 | 5 | 10 | 30 | 100

export interface QuestionResult {
  question: string
  emotion: Emotion
}

export interface VerdictResult {
  coins: CoinAmount
  reaction: string
  emotion: Emotion
}

// #endregion
