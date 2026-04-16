<script setup lang="ts">
//#region Meta
definePageMeta({ layout: false })
//#endregion

//#region Types
interface Field {
  key: string
  label: string
  type: 'string' | 'email' | 'tel' | 'number' | 'boolean' | 'date' | 'textarea' | 'select'
  required?: boolean
  placeholder?: string
  description?: string
  options?: string[]
}

interface FormSchema {
  title: string
  description?: string
  fields: Field[]
}
//#endregion

//#region State
const step = ref<'prompt' | 'form'>('prompt')
const prompt = ref('')
const loading = ref(false)
const genError = ref('')
const schema = ref<FormSchema | null>(null)
const formData = ref<Record<string, any>>({})
const validationErrors = ref<Record<string, string>>({})

const showSubmit = ref(false)
const submitType = ref<'email' | 'api'>('email')
const submitEmail = ref('contact@example.com')
const submitUrl = ref('https://api.example.com/submit')
const submitting = ref(false)
const submitError = ref('')
const submitted = ref(false)
//#endregion

//#region Generation
async function generateForm() {
  if (!prompt.value.trim()) return
  loading.value = true
  genError.value = ''
  submitted.value = false
  try {
    const result = await $fetch<FormSchema>('/api/generate-form', {
      method: 'POST',
      body: { prompt: prompt.value },
    })
    schema.value = result
    formData.value = {}
    validationErrors.value = {}
    for (const field of result.fields) {
      formData.value[field.key] = field.type === 'boolean' ? false : field.type === 'number' ? null : ''
    }
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
}
//#endregion

//#region Validation
function validate() {
  if (!schema.value) return false
  validationErrors.value = {}
  let valid = true
  for (const field of schema.value.fields) {
    const val = formData.value[field.key]
    if (field.required && (val === '' || val === null || val === undefined || (field.type === 'boolean' && !val))) {
      validationErrors.value[field.key] = `${field.label} is required`
      valid = false
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
  const url = `mailto:${submitEmail.value}?subject=${encodeURIComponent(schema.value!.title)}&body=${encodeURIComponent(body)}`
  window.open(url)
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

//#region Input type mapping
function inputType(field: Field): string {
  const map: Record<string, string> = { email: 'email', tel: 'tel', number: 'number', date: 'date', string: 'text' }
  return map[field.type] ?? 'text'
}
//#endregion
</script>

<template>
  <!--#region Layout -->
  <div class="min-h-screen bg-zinc-950 text-white font-geist">

    <!--#region Header -->
    <header class="border-b border-white/5 px-6 py-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <NuxtLink to="/en" class="text-zinc-500 hover:text-white transition-colors text-sm">
          ← diniz.is
        </NuxtLink>
        <span class="text-zinc-700">/</span>
        <span class="text-sm font-medium">Form Builder</span>
      </div>
      <div class="text-xs text-zinc-600 font-mono">powered by Groq</div>
    </header>
    <!--#endregion -->

    <main class="mx-auto max-w-2xl px-6 py-12">

      <!--#region Prompt Step -->
      <div v-if="step === 'prompt'" class="flex flex-col gap-8">
        <div class="flex flex-col gap-2">
          <h1 class="text-2xl font-semibold tracking-tight">AI Form Builder</h1>
          <p class="text-zinc-400 text-sm leading-relaxed">
            Describe the form you need. Groq will generate a schema and render it instantly.
          </p>
        </div>

        <div class="flex flex-col gap-3">
          <textarea
            v-model="prompt"
            rows="4"
            placeholder='e.g. "A job application form with name, email, resume link, years of experience, and availability date"'
            class="w-full rounded-lg border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-600 resize-none focus:border-white/20 focus:outline-none transition-colors"
            @keydown.meta.enter="generateForm"
            @keydown.ctrl.enter="generateForm"
          />
          <div class="flex items-center justify-between">
            <span v-if="genError" class="text-xs text-red-400">{{ genError }}</span>
            <span v-else class="text-xs text-zinc-600">⌘↵ to generate</span>
            <button
              :disabled="loading || !prompt.trim()"
              class="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition-all hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
              @click="generateForm"
            >
              <span v-if="loading" class="inline-block size-3.5 animate-spin rounded-full border-2 border-zinc-400 border-t-zinc-900" />
              <span>{{ loading ? 'Generating…' : 'Generate form →' }}</span>
            </button>
          </div>
        </div>

        <!--#region Examples -->
        <div class="flex flex-col gap-2">
          <p class="text-xs text-zinc-600 uppercase tracking-widest">Examples</p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="ex in [
                'Contact form with name, email and message',
                'Event RSVP with name, dietary restrictions, +1 option',
                'Bug report with title, severity, steps to reproduce',
              ]"
              :key="ex"
              class="rounded-md border border-white/5 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-400 hover:border-white/10 hover:text-white transition-colors"
              @click="prompt = ex"
            >
              {{ ex }}
            </button>
          </div>
        </div>
        <!--#endregion -->
      </div>
      <!--#endregion -->

      <!--#region Form Step -->
      <div v-else-if="step === 'form' && schema" class="flex flex-col gap-8">

        <!--#region Form Header -->
        <div class="flex items-start justify-between gap-4">
          <div class="flex flex-col gap-1">
            <h1 class="text-2xl font-semibold tracking-tight">{{ schema.title }}</h1>
            <p v-if="schema.description" class="text-zinc-400 text-sm">{{ schema.description }}</p>
          </div>
          <button
            class="shrink-0 rounded-md border border-white/5 px-3 py-1.5 text-xs text-zinc-500 hover:text-white hover:border-white/10 transition-colors"
            @click="reset"
          >
            ← Regenerate
          </button>
        </div>
        <!--#endregion -->

        <!--#region Submitted State -->
        <div v-if="submitted" class="flex flex-col items-center gap-4 rounded-xl border border-green-500/20 bg-green-500/5 py-12 text-center">
          <div class="size-12 rounded-full border border-green-500/30 bg-green-500/10 flex items-center justify-center">
            <UIcon name="heroicons:check" class="size-5 text-green-400" />
          </div>
          <div>
            <p class="font-medium text-green-300">{{ submitType === 'email' ? 'Email client opened' : 'Submitted successfully' }}</p>
            <p class="text-sm text-zinc-500 mt-1">Form data has been sent.</p>
          </div>
          <button class="text-xs text-zinc-500 hover:text-white transition-colors underline underline-offset-2" @click="submitted = false">
            Submit again
          </button>
        </div>
        <!--#endregion -->

        <!--#region Dynamic Form Fields -->
        <form v-else class="flex flex-col gap-5" @submit.prevent="showSubmit && handleSubmit()">
          <div v-for="field in schema.fields" :key="field.key" class="flex flex-col gap-1.5">
            <label :for="field.key" class="text-sm font-medium text-zinc-200">
              {{ field.label }}
              <span v-if="field.required" class="ml-1 text-zinc-500">*</span>
            </label>

            <!--#region Boolean (checkbox) -->
            <div v-if="field.type === 'boolean'" class="flex items-center gap-2">
              <input
                :id="field.key"
                v-model="formData[field.key]"
                type="checkbox"
                class="size-4 rounded border-white/10 bg-zinc-900 accent-white cursor-pointer"
              >
              <span v-if="field.placeholder" class="text-sm text-zinc-400">{{ field.placeholder }}</span>
            </div>
            <!--#endregion -->

            <!--#region Select -->
            <select
              v-else-if="field.type === 'select'"
              :id="field.key"
              v-model="formData[field.key]"
              class="w-full rounded-lg border bg-zinc-900 px-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
              :class="validationErrors[field.key] ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-white/20'"
            >
              <option value="" disabled>{{ field.placeholder ?? 'Select an option' }}</option>
              <option v-for="opt in field.options" :key="opt" :value="opt">{{ opt }}</option>
            </select>
            <!--#endregion -->

            <!--#region Textarea -->
            <textarea
              v-else-if="field.type === 'textarea'"
              :id="field.key"
              v-model="formData[field.key]"
              rows="3"
              :placeholder="field.placeholder"
              class="w-full rounded-lg border bg-zinc-900 px-4 py-2.5 text-sm text-white placeholder-zinc-600 resize-none focus:outline-none transition-colors"
              :class="validationErrors[field.key] ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-white/20'"
            />
            <!--#endregion -->

            <!--#region Standard Inputs -->
            <input
              v-else
              :id="field.key"
              v-model="formData[field.key]"
              :type="inputType(field)"
              :placeholder="field.placeholder"
              class="w-full rounded-lg border bg-zinc-900 px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none transition-colors"
              :class="validationErrors[field.key] ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-white/20'"
            >
            <!--#endregion -->

            <p v-if="validationErrors[field.key]" class="text-xs text-red-400">{{ validationErrors[field.key] }}</p>
            <p v-else-if="field.description" class="text-xs text-zinc-500">{{ field.description }}</p>
          </div>

          <!--#region Submit Configuration Toggle -->
          <div class="mt-2 border-t border-white/5 pt-6 flex flex-col gap-4">
            <button
              type="button"
              class="flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors"
              @click="showSubmit = !showSubmit"
            >
              <span
                class="inline-flex size-4 items-center justify-center rounded border transition-colors"
                :class="showSubmit ? 'border-white/20 bg-white/10' : 'border-white/10'"
              >
                <UIcon v-if="showSubmit" name="heroicons:check" class="size-2.5 text-white" />
              </span>
              Add submit action
            </button>

            <!--#region Submit Config -->
            <div v-if="showSubmit" class="flex flex-col gap-4 rounded-xl border border-white/5 bg-zinc-900/50 p-4">
              <div class="flex items-center gap-3">
                <button
                  type="button"
                  v-for="opt in (['email', 'api'] as const)"
                  :key="opt"
                  class="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors"
                  :class="submitType === opt ? 'border-white/20 bg-white/10 text-white' : 'border-white/5 text-zinc-500 hover:text-zinc-300'"
                  @click="submitType = opt"
                >
                  <UIcon :name="opt === 'email' ? 'heroicons:envelope' : 'heroicons:cloud-arrow-up'" class="size-3" />
                  {{ opt === 'email' ? 'Open email client' : 'POST to API' }}
                </button>
              </div>

              <div v-if="submitType === 'email'" class="flex flex-col gap-1.5">
                <label class="text-xs text-zinc-500">Recipient email</label>
                <input
                  v-model="submitEmail"
                  type="email"
                  placeholder="contact@example.com"
                  class="w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-white/20 focus:outline-none"
                >
              </div>

              <div v-else class="flex flex-col gap-1.5">
                <label class="text-xs text-zinc-500">API endpoint (POST)</label>
                <input
                  v-model="submitUrl"
                  type="url"
                  placeholder="https://api.example.com/submit"
                  class="w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-white/20 focus:outline-none"
                >
                <p class="text-xs text-zinc-600">Sends <code class="text-zinc-400">{"payload": {...formData}}</code></p>
              </div>

              <p v-if="submitError" class="text-xs text-red-400">{{ submitError }}</p>

              <button
                type="button"
                :disabled="submitting"
                class="flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 transition-all hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed"
                @click="handleSubmit"
              >
                <span v-if="submitting" class="inline-block size-3.5 animate-spin rounded-full border-2 border-zinc-400 border-t-zinc-900" />
                {{ submitType === 'email' ? 'Open email client →' : 'Submit →' }}
              </button>
            </div>
            <!--#endregion -->
          </div>
          <!--#endregion -->
        </form>
        <!--#endregion -->

      </div>
      <!--#endregion -->

    </main>
  </div>
  <!--#endregion -->
</template>
