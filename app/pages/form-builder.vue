<script setup lang="ts">
//#region Meta
definePageMeta({ layout: 'default' })
useHead({ title: 'AI Form Builder' })
//#endregion

//#region Types
interface IField {
  key: string
  label: string
  type: 'string' | 'email' | 'tel' | 'number' | 'boolean' | 'date' | 'textarea' | 'select'
  required?: boolean
  placeholder?: string
  description?: string
  options?: string[]
}

interface IFormSchema {
  title: string
  description?: string
  fields: IField[]
}
//#endregion

//#region State
const step = ref<'prompt' | 'form'>('prompt')
const prompt = ref('')
const loading = ref(false)
const genError = ref('')
const schema = ref<IFormSchema | null>(null)
const formData = ref<Record<string, any>>({})
const validationErrors = ref<Record<string, string>>({})

const showSubmit = ref(false)
const submitType = ref<'email' | 'api'>('email')
const submitEmail = ref('contact@example.com')
const submitUrl = ref('https://api.example.com/submit')
const submitting = ref(false)
const submitError = ref('')
const submitted = ref(false)

const editingTitle = ref(false)
const editingDescription = ref(false)

const EXAMPLES = [
  'Contact form with name, email and message',
  'Event RSVP with name, dietary restrictions and +1 option',
  'Bug report with title, severity and steps to reproduce',
]

const SUBMIT_OPTIONS = [
  { value: 'email', label: 'Open email client' },
  { value: 'api', label: 'POST to API' },
]
//#endregion

//#region Generation
async function generateForm() {
  if (!prompt.value.trim()) return
  loading.value = true
  genError.value = ''
  submitted.value = false

  try {
    const result = await $fetch<IFormSchema>('/api/generate-form', {
      method: 'POST',
      body: { prompt: prompt.value },
    })

    schema.value = result
    formData.value = {}
    validationErrors.value = {}

    for (const field of result.fields)
      formData.value[field.key] = field.type === 'boolean' ? false : field.type === 'number' ? null : ''

    step.value = 'form'
  }
  catch (e: any) {
    genError.value = e?.data?.message ?? e?.message ?? 'Failed to generate form'
  }
  finally {
    loading.value = false
  }
}

function reset() {
  step.value = 'prompt'
  schema.value = null
  formData.value = {}
  validationErrors.value = {}
  submitted.value = false
  submitError.value = ''
  showSubmit.value = false
}

function useExample(ex: string) {
  prompt.value = ex
}
//#endregion

//#region Validation
function validate() {
  if (!schema.value) return false
  validationErrors.value = {}
  let valid = true

  for (const field of schema.value.fields) {
    const val = formData.value[field.key]
    const isEmpty = val === '' || val === null || val === undefined || (field.type === 'boolean' && !val)

    if (field.required && isEmpty) {
      validationErrors.value[field.key] = `${field.label} is required`
      valid = false
      continue
    }

    if (field.type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      validationErrors.value[field.key] = 'Invalid email address'
      valid = false
    }
  }

  return valid
}
//#endregion

//#region Submit
function submitViaEmail() {
  const body = schema.value!.fields
    .map(f => `${f.label}: ${formData.value[f.key] ?? ''}`)
    .join('\n')

  window.open(
    `mailto:${submitEmail.value}?subject=${encodeURIComponent(schema.value!.title)}&body=${encodeURIComponent(body)}`,
  )
  submitted.value = true
}

async function submitViaAPI() {
  submitting.value = true
  submitError.value = ''

  try {
    await $fetch(submitUrl.value, {
      method: 'POST',
      body: { payload: formData.value },
    })
    submitted.value = true
  }
  catch (e: any) {
    submitError.value = e?.data?.message ?? e?.message ?? 'Submission failed'
  }
  finally {
    submitting.value = false
  }
}

function handleSubmit() {
  if (!validate()) return
  if (submitType.value === 'email') submitViaEmail()
  else submitViaAPI()
}
//#endregion

//#region Helpers
function inputType(field: IField): string {
  const map: Record<string, string> = { email: 'email', tel: 'tel', number: 'number', date: 'date' }
  return map[field.type] ?? 'text'
}

function selectItems(field: IField) {
  return field.options?.map(o => ({ label: o, value: o })) ?? []
}
//#endregion

//#region Export
function escapeHtml(str: string): string {
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function buildFieldHtml(field: IField): string {
  const req = field.required ? ' required' : ''
  const ph = field.placeholder ? ` placeholder="${escapeHtml(field.placeholder)}"` : ''
  const id = `f-${field.key}`
  const desc = field.description ? `<p class="desc">${escapeHtml(field.description)}</p>` : ''
  const reqMark = field.required ? ' <span class="req">*</span>' : ''

  let input: string
  if (field.type === 'boolean') {
    input = `<label class="cb"><input type="checkbox" name="${field.key}" id="${id}"${req}> ${escapeHtml(field.placeholder ?? field.label)}</label>`
  }
  else if (field.type === 'select') {
    const opts = (field.options ?? []).map(o => `<option value="${escapeHtml(o)}">${escapeHtml(o)}</option>`).join('')
    input = `<select name="${field.key}" id="${id}"${req}><option value="">Select an option</option>${opts}</select>`
  }
  else if (field.type === 'textarea') {
    input = `<textarea name="${field.key}" id="${id}" rows="4"${ph}${req}></textarea>`
  }
  else {
    input = `<input type="${field.type === 'string' ? 'text' : field.type}" name="${field.key}" id="${id}"${ph}${req}>`
  }

  return `<div class="field"><label for="${id}">${escapeHtml(field.label)}${reqMark}</label>${desc}${input}</div>`
}

function buildHtml(s: IFormSchema): string {
  const fields = s.fields.map(buildFieldHtml).join('\n      ')
  const desc = s.description ? `<p class="form-desc">${escapeHtml(s.description)}</p>` : ''
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(s.title)}</title>
  <style>
    *,*::before,*::after{box-sizing:border-box}
    body{font-family:system-ui,-apple-system,sans-serif;background:#0f0f11;color:#e5e5e5;margin:0;padding:2rem 1rem;min-height:100vh}
    .wrap{max-width:600px;margin:0 auto}
    h1{font-size:2rem;font-weight:600;margin:0 0 .4rem}
    .form-desc{color:#a0a0a8;font-size:.9rem;margin:0 0 2rem}
    form{display:flex;flex-direction:column;gap:1.25rem}
    .field{display:flex;flex-direction:column;gap:.35rem}
    label{font-size:.875rem;font-weight:500}
    .req{color:#f87171}
    .desc{font-size:.8rem;color:#a0a0a8;margin:0}
    input:not([type=checkbox]),textarea,select{background:#1a1a1f;border:1px solid #2e2e36;border-radius:8px;color:#e5e5e5;font-size:.9rem;padding:.6rem .75rem;width:100%;outline:none;transition:border-color .15s;font-family:inherit}
    input:not([type=checkbox]):focus,textarea:focus,select:focus{border-color:#6366f1}
    .cb{display:flex;align-items:center;gap:.5rem;font-size:.875rem;cursor:pointer}
    hr{border:none;border-top:1px solid #2e2e36;margin:.25rem 0}
    button{background:#e5e5e5;color:#0f0f11;border:none;border-radius:8px;font-size:.875rem;font-weight:600;padding:.65rem 1.5rem;cursor:pointer;align-self:flex-end;transition:opacity .15s}
    button:hover{opacity:.85}
  </style>
</head>
<body>
  <div class="wrap">
    <h1>${escapeHtml(s.title)}</h1>
    ${desc}
    <form>
      ${fields}
      <hr>
      <button type="submit">Submit</button>
    </form>
  </div>
</body>
</html>`
}

function exportToHtml() {
  if (!schema.value) return
  const html = buildHtml(schema.value)
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${schema.value.title.toLowerCase().replace(/\s+/g, '-')}.html`
  a.click()
  URL.revokeObjectURL(url)
}
//#endregion
</script>

<template>
  <section class="mx-auto mt-4 flex max-w-2xl flex-col px-6 py-12 sm:mt-12">

    <!--#region Prompt Step -->
    <div v-if="step === 'prompt'" class="flex flex-col gap-8">

      <div class="flex flex-col gap-2">
        <h1 class="font-newsreader italic text-white-shadow text-4xl">
          AI Form Builder
        </h1>
        <p class="text-muted text-sm leading-relaxed">
          Describe the form you need — Groq generates a schema and renders it instantly.
        </p>
      </div>

      <div class="flex flex-col gap-3">
        <UTextarea
          v-model="prompt"
          :rows="4"
          placeholder='e.g. "A job application with name, email, years of experience and availability"'
          autoresize
          @keydown.meta.enter="generateForm"
          @keydown.ctrl.enter="generateForm"
        />

        <UAlert
          v-if="genError"
          color="error"
          variant="soft"
          :description="genError"
        />

        <div class="flex items-center justify-between">
          <span class="text-xs text-muted">⌘↵ to generate</span>
          <UButton
            :loading="loading"
            :disabled="!prompt.trim()"
            label="Generate form"
            trailing-icon="heroicons:arrow-right"
            color="neutral"
            @click="generateForm"
          />
        </div>
      </div>

      <!--#region Examples -->
      <div class="flex flex-col gap-3">
        <p class="text-xs text-muted uppercase tracking-widest">Examples</p>
        <div class="flex flex-wrap gap-2">
          <UButton
            v-for="ex in EXAMPLES"
            :key="ex"
            :label="ex"
            size="xs"
            color="neutral"
            variant="outline"
            @click="useExample(ex)"
          />
        </div>
      </div>
      <!--#endregion -->

    </div>
    <!--#endregion -->

    <!--#region Form Step -->
    <div v-else-if="step === 'form' && schema" class="flex flex-col gap-8">

      <!--#region Form Header -->
      <div class="flex items-start justify-between gap-4">
        <div class="flex flex-col gap-2 flex-1 min-w-0">

          <!--#region Editable Title -->
          <div class="group flex items-center gap-2">
            <h1
              v-if="!editingTitle"
              class="font-newsreader italic text-white-shadow text-3xl cursor-pointer truncate"
              @click="editingTitle = true"
            >
              {{ schema.title }}
            </h1>
            <UInput
              v-else
              v-model="schema.title"
              autofocus
              size="xl"
              class="flex-1"
              @blur="editingTitle = false"
              @keydown.enter="editingTitle = false"
              @keydown.escape="editingTitle = false"
            />
            <UButton
              v-if="!editingTitle"
              icon="heroicons:pencil-square"
              size="xs"
              color="neutral"
              variant="ghost"
              class="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              @click="editingTitle = true"
            />
          </div>
          <!--#endregion -->

          <!--#region Editable Description -->
          <div class="group flex items-center gap-2">
            <p
              v-if="!editingDescription"
              class="text-muted text-sm cursor-pointer"
              :class="{ 'italic opacity-40': !schema.description }"
              @click="editingDescription = true"
            >
              {{ schema.description || 'Add a description…' }}
            </p>
            <UInput
              v-else
              v-model="schema.description"
              autofocus
              size="sm"
              class="flex-1"
              placeholder="Form description"
              @blur="editingDescription = false"
              @keydown.enter="editingDescription = false"
              @keydown.escape="editingDescription = false"
            />
            <UButton
              v-if="!editingDescription"
              icon="heroicons:pencil-square"
              size="xs"
              color="neutral"
              variant="ghost"
              class="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              @click="editingDescription = true"
            />
          </div>
          <!--#endregion -->

        </div>

        <div class="flex items-center gap-2 shrink-0">
          <UButton
            label="Export HTML"
            leading-icon="heroicons:code-bracket"
            size="xs"
            color="neutral"
            variant="outline"
            @click="exportToHtml"
          />
          <UButton
            label="Regenerate"
            leading-icon="heroicons:arrow-left"
            size="xs"
            color="neutral"
            variant="ghost"
            @click="reset"
          />
        </div>
      </div>
      <!--#endregion -->

      <!--#region Submitted State -->
      <div
        v-if="submitted"
        class="flex flex-col items-center gap-4 rounded-xl border border-green-500/20 bg-green-500/5 py-12 text-center"
      >
        <UIcon name="heroicons:check-circle" class="size-10 text-green-400" />
        <div>
          <p class="font-medium text-green-300">
            {{ submitType === 'email' ? 'Email client opened' : 'Submitted successfully' }}
          </p>
          <p class="text-sm text-muted mt-1">Form data has been sent.</p>
        </div>
        <UButton label="Submit again" size="xs" color="neutral" variant="ghost" @click="submitted = false" />
      </div>
      <!--#endregion -->

      <!--#region Dynamic Form -->
      <form v-else class="flex flex-col gap-5" @submit.prevent>

        <!--#region Fields -->
        <UFormField
          v-for="field in schema.fields"
          :key="field.key"
          :label="field.label"
          :description="field.description"
          :error="validationErrors[field.key]"
          :required="field.required"
        >
          <!--#region Boolean -->
          <UCheckbox
            v-if="field.type === 'boolean'"
            v-model="formData[field.key]"
            :label="field.placeholder"
          />
          <!--#endregion -->

          <!--#region Select -->
          <USelect
            v-else-if="field.type === 'select'"
            v-model="formData[field.key]"
            :items="selectItems(field)"
            :placeholder="field.placeholder ?? 'Select an option'"
            class="w-full"
          />
          <!--#endregion -->

          <!--#region Textarea -->
          <UTextarea
            v-else-if="field.type === 'textarea'"
            v-model="formData[field.key]"
            :placeholder="field.placeholder"
            :rows="3"
            autoresize
            class="w-full"
          />
          <!--#endregion -->

          <!--#region Standard input -->
          <UInput
            v-else
            v-model="formData[field.key]"
            :type="inputType(field)"
            :placeholder="field.placeholder"
            class="w-full"
          />
          <!--#endregion -->
        </UFormField>
        <!--#endregion -->

        <USeparator class="my-2" />

        <!--#region Submit Toggle -->
        <UButton
          :label="showSubmit ? 'Remove submit action' : 'Add submit action'"
          :leading-icon="showSubmit ? 'heroicons:minus' : 'heroicons:plus'"
          size="xs"
          color="neutral"
          variant="ghost"
          class="self-start"
          @click="showSubmit = !showSubmit"
        />
        <!--#endregion -->

        <!--#region Submit Config -->
        <div v-if="showSubmit" class="flex flex-col gap-4 rounded-xl border border-default bg-muted/30 p-4">
          <URadioGroup
            v-model="submitType"
            :items="SUBMIT_OPTIONS"
            orientation="horizontal"
          />

          <UFormField v-if="submitType === 'email'" label="Recipient email">
            <UInput v-model="submitEmail" type="email" placeholder="contact@example.com" class="w-full" />
          </UFormField>

          <UFormField
            v-else
            label="API endpoint"
            description='Sends {"payload": {...formData}} as JSON body'
          >
            <UInput v-model="submitUrl" type="url" placeholder="https://api.example.com/submit" class="w-full" />
          </UFormField>

          <UAlert
            v-if="submitError"
            color="error"
            variant="soft"
            :description="submitError"
          />

          <UButton
            :loading="submitting"
            :label="submitType === 'email' ? 'Open email client' : 'Submit'"
            trailing-icon="heroicons:arrow-right"
            color="neutral"
            class="self-end"
            @click="handleSubmit"
          />
        </div>
        <!--#endregion -->

      </form>
      <!--#endregion -->

    </div>
    <!--#endregion -->

  </section>
</template>
