//#region Tool Definition
const CREATE_FORM_TOOL = {
  type: 'function',
  function: {
    name: 'create_form_schema',
    description: 'Create a structured form schema based on the user description',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        fields: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              key: { type: 'string', description: 'Unique camelCase identifier' },
              label: { type: 'string' },
              type: {
                type: 'string',
                enum: ['string', 'email', 'tel', 'number', 'boolean', 'date', 'textarea', 'select'],
              },
              required: { type: 'boolean' },
              placeholder: { type: 'string' },
              description: { type: 'string' },
              options: { type: 'array', items: { type: 'string' } },
            },
            required: ['key', 'label', 'type'],
          },
        },
      },
      required: ['title', 'fields'],
    },
  },
}
//#endregion

export default defineEventHandler(async (event) => {
  const { prompt } = await readBody(event)

  if (!prompt?.trim())
    throw createError({ statusCode: 400, message: 'Prompt is required' })

  const apiKey = process.env.NUXT_PRIVATE_GROQ_API_KEY
  if (!apiKey)
    throw createError({ statusCode: 500, message: 'Groq API key not configured' })

  const response = await $fetch<any>('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: {
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are a form schema generator. Always call create_form_schema with a well-structured schema. Use concise, clear labels. Infer sensible field types and mark required fields.',
        },
        { role: 'user', content: prompt },
      ],
      tools: [CREATE_FORM_TOOL],
      tool_choice: { type: 'function', function: { name: 'create_form_schema' } },
    },
  })

  const toolCall = response.choices?.[0]?.message?.tool_calls?.[0]
  if (!toolCall)
    throw createError({ statusCode: 500, message: 'No tool call returned from Groq' })

  return JSON.parse(toolCall.function.arguments)
})
