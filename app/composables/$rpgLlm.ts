import type { QuestionResult, VerdictResult, Personality } from '~/game/types'

// #region Fallbacks

const FALLBACK_QUESTIONS: QuestionResult[] = [
  { question: '「はい」と答えると嘘になり、「いいえ」と答えると本当になる質問は何ですか？', emotion: 'thinking' },
  { question: '世界で一番重いものは何だと思いますか？ただし「鉄」は不正解です。', emotion: 'thinking' },
  { question: '昨日のあなた、今日のあなた、明日のあなた——誰が一番「あなた」ですか？', emotion: 'thinking' },
]

function fallbackQuestion(): QuestionResult {
  return FALLBACK_QUESTIONS[Math.floor(Math.random() * FALLBACK_QUESTIONS.length)]
}

// #endregion

// #region Composable

const $rpgLlm = {
  async generateQuestion(personality: Personality, npcName: string): Promise<QuestionResult> {
    try {
      return await $fetch<QuestionResult>('/api/rpg/ask', {
        method: 'POST',
        body: { personality, npcName },
      })
    } catch {
      return fallbackQuestion()
    }
  },

  async judgeAnswer(
    question: string,
    answer: string,
    personality: Personality,
    npcName: string,
  ): Promise<VerdictResult> {
    try {
      return await $fetch<VerdictResult>('/api/rpg/judge', {
        method: 'POST',
        body: { question, answer, personality, npcName },
      })
    } catch {
      return { coins: 0, reaction: '…なるほど。', emotion: 'thinking' }
    }
  },
} as const

export default $rpgLlm

// #endregion
