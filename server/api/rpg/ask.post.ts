import type { Personality, QuestionResult, Emotion } from '~/game/types'

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

const ASK_TOOL = {
  type: 'function',
  function: {
    name: 'ask',
    description: 'Ask the player a tricky or deceptive question',
    parameters: {
      type: 'object',
      properties: {
        question: { type: 'string' },
        emotion: {
          type: 'string',
          enum: ['happy', 'sad', 'angry', 'thinking', 'bored', 'cheerleading', 'cheers'],
        },
      },
      required: ['question', 'emotion'],
    },
  },
} as const

// #endregion

// #region Fallback

const FALLBACKS: QuestionResult[] = [
  { question: '「はい」と答えると嘘になり、「いいえ」と答えると本当になる質問は何ですか？', emotion: 'thinking' },
  { question: '世界で一番重いものは何だと思いますか？ただし「鉄」は不正解です。', emotion: 'thinking' },
  { question: '昨日のあなた、今日のあなた、明日のあなた——誰が一番「あなた」ですか？', emotion: 'thinking' },
]

function fallback(): QuestionResult {
  return FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)]
}

// #endregion

// #region Handler

export default defineEventHandler(async (event) => {
  const { personality, npcName } = await readBody<{ personality: Personality; npcName: string }>(event)

  const apiKey = process.env.NUXT_PRIVATE_GROQ_API_KEY
  if (!apiKey) return fallback()

  const systemPrompt = `あなたはファンタジーRPGのNPC「${npcName}」です。

${PERSONALITY_PROMPTS[personality]}

あなたはプレイヤーを試すためのゲームをしています。
プレイヤーを混乱させたり、深く考えさせたり、予想外の答えを引き出すための「意地悪な質問」または「トリック質問」を一つ作ってください。
質問はパズル・論理トリック・道徳的ジレンマ・反転した常識など何でも構いません。
あなたのキャラクターに合った質問スタイルにしてください。`

  try {
    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'system', content: systemPrompt }],
        tools: [ASK_TOOL],
        tool_choice: { type: 'function', function: { name: 'ask' } },
        max_tokens: 200,
        temperature: 0.95,
      }),
    })

    if (!res.ok) return fallback()

    const data = await res.json() as { choices: Array<{ message: { tool_calls?: Array<{ function: { arguments: string } }> } }> }
    const raw = data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments
    if (!raw) return fallback()

    const args = JSON.parse(raw) as Record<string, unknown>
    const question = typeof args.question === 'string' ? args.question.trim() : null
    if (!question) return fallback()

    const validEmotions: Emotion[] = ['happy', 'sad', 'angry', 'thinking', 'bored', 'cheerleading', 'cheers']
    const emotion: Emotion = validEmotions.includes(args.emotion as Emotion) ? (args.emotion as Emotion) : 'thinking'

    return { question, emotion } satisfies QuestionResult
  } catch {
    return fallback()
  }
})

// #endregion
