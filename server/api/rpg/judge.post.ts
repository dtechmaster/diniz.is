import type { Personality, VerdictResult, CoinAmount, Emotion } from '~/game/types'

// #region Constants

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.1-8b-instant'

// #endregion

// #region Personality Prompts

const PERSONALITY_PROMPTS: Record<Personality, string> = {
  shy: `性格：内気で優しい。声が小さく、すぐ顔が赤くなる。
話し方：語尾が小さくなる。「…」を多用。謝りがち。
判断傾向：優しいので少し甘め。でも騙されるほどではない。`,

  tsundere: `性格：ツンデレ。素直になれず、好意をひた隠しにする。
話し方：「べ、別に…」「勘違いしないでよ」など否定から入る。
判断傾向：厳しめ。良い答えでも褒めるのが恥ずかしい。でもコインは正直。`,

  playful: `性格：元気でいたずらっぽい。相手をからかって楽しんでいる。
話し方：軽快でテンポが速い。「へへ〜」「やった！」など。
判断傾向：面白い・ユニークな答えを高く評価する。面白くない答えには手加減しない。`,

  cold: `性格：クールで無表情。感情をほとんど表に出さない。
話し方：短く、淡々と。感嘆符は使わない。
判断傾向：非常に厳しい。100コインは天才的な答えにしか与えない。`,
}

// #endregion

// #region Tool

const JUDGE_TOOL = {
  type: 'function',
  function: {
    name: 'judge',
    description: "Judge the player's answer and award coins",
    parameters: {
      type: 'object',
      properties: {
        coins: { type: 'integer', enum: [0, 5, 10, 30, 100] },
        reaction: { type: 'string' },
        emotion: {
          type: 'string',
          enum: ['happy', 'sad', 'angry', 'thinking', 'bored', 'cheerleading', 'cheers'],
        },
      },
      required: ['coins', 'reaction', 'emotion'],
    },
  },
} as const

// #endregion

// #region Fallback

function fallback(): VerdictResult {
  const tiers: CoinAmount[] = [0, 5, 10, 30]
  return {
    coins: tiers[Math.floor(Math.random() * tiers.length)],
    reaction: '…なるほど。',
    emotion: 'thinking',
  }
}

// #endregion

// #region Handler

export default defineEventHandler(async (event) => {
  const { question, answer, personality, npcName } = await readBody<{
    question: string
    answer: string
    personality: Personality
    npcName: string
  }>(event)

  const apiKey = process.env.NUXT_PRIVATE_GROQ_API_KEY
  if (!apiKey) return fallback()

  const systemPrompt = `あなたはファンタジーRPGのNPC「${npcName}」です。

${PERSONALITY_PROMPTS[personality]}

あなたは先ほどプレイヤーにこの質問をしました：
「${question}」

プレイヤーはこう答えました：
「${answer}」

この回答をあなたのキャラクターとして判断し、コインを与えてください。
反応はキャラクターとして自然に、1〜2文で。`

  try {
    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'system', content: systemPrompt }],
        tools: [JUDGE_TOOL],
        tool_choice: { type: 'function', function: { name: 'judge' } },
        max_tokens: 200,
        temperature: 0.75,
      }),
    })

    if (!res.ok) return fallback()

    const data = await res.json() as { choices: Array<{ message: { tool_calls?: Array<{ function: { arguments: string } }> } }> }
    const raw = data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments
    if (!raw) return fallback()

    const args = JSON.parse(raw) as Record<string, unknown>
    const reaction = typeof args.reaction === 'string' ? args.reaction.trim() : '…'

    const validCoins: CoinAmount[] = [0, 5, 10, 30, 100]
    const coins: CoinAmount = validCoins.includes(args.coins as CoinAmount) ? (args.coins as CoinAmount) : 0

    const validEmotions: Emotion[] = ['happy', 'sad', 'angry', 'thinking', 'bored', 'cheerleading', 'cheers']
    const emotion: Emotion = validEmotions.includes(args.emotion as Emotion) ? (args.emotion as Emotion) : 'thinking'

    return { coins, reaction, emotion } satisfies VerdictResult
  } catch {
    return fallback()
  }
})

// #endregion
