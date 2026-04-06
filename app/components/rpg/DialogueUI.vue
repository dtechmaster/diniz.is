<script setup lang="ts">
//#region Imports
import { ref, watch, computed, nextTick } from 'vue'
import { gameStore } from '~/game/store'
import type { Emotion } from '~/game/types'
//#endregion

//#region Emotion Map
const emotionMap: Record<Emotion, string> = {
  thinking:     '/rpg/npc_01_thinking.png',
  happy:        '/rpg/npc_01_happy.png',
  sad:          '/rpg/npc_01_sad.png',
  angry:        '/rpg/npc_01_angry.png',
  bored:        '/rpg/npc_01_bored.png',
  cheerleading: '/rpg/npc_01_cheerleading.png',
  cheers:       '/rpg/npc_01_cheers.png',
}
//#endregion

//#region State
const playerInput = ref('')
const inputEl = ref<HTMLInputElement | null>(null)
const currentQuestion = ref('')

const portrait = computed(() => emotionMap[gameStore.emotion])

const isVisible = computed(() =>
  gameStore.state === 'waiting_llm' ||
  gameStore.state === 'npc_question' ||
  gameStore.state === 'npc_verdict',
)

const isLoading = computed(() => gameStore.state === 'waiting_llm')

const coinTierClass = computed(() => {
  if (gameStore.lastCoins === 100) return 'coins--legendary'
  if (gameStore.lastCoins >= 30)  return 'coins--great'
  if (gameStore.lastCoins >= 10)  return 'coins--good'
  if (gameStore.lastCoins >= 5)   return 'coins--weak'
  return 'coins--none'
})
//#endregion

//#region Flow
async function startInteraction() {
  gameStore.emotion = 'thinking'
  gameStore.state = 'waiting_llm'
  currentQuestion.value = ''
  playerInput.value = ''

  const result = await $rpgLlm.generateQuestion(gameStore.personality, gameStore.npcName)

  currentQuestion.value = result.question
  gameStore.npcText = result.question
  gameStore.emotion = result.emotion
  gameStore.state = 'npc_question'

  await nextTick()
  inputEl.value?.focus()
}

async function submitAnswer() {
  const answer = playerInput.value.trim()
  if (!answer) return

  gameStore.playerText = answer
  gameStore.emotion = 'thinking'
  gameStore.state = 'waiting_llm'

  const result = await $rpgLlm.judgeAnswer(
    currentQuestion.value,
    answer,
    gameStore.personality,
    gameStore.npcName,
  )

  gameStore.npcText = result.reaction
  gameStore.emotion = result.emotion
  gameStore.lastCoins = result.coins
  gameStore.coins += result.coins
  gameStore.state = 'npc_verdict'
}

function closeDialogue() {
  gameStore.state = 'idle'
  gameStore.npcText = ''
  gameStore.playerText = ''
  playerInput.value = ''
  currentQuestion.value = ''
}
//#endregion

//#region Watchers
watch(
  () => gameStore.state,
  function onStateChange(state) {
    if (state === 'interacting') startInteraction()
  },
)
//#endregion
</script>

<template>
  <!--#region Dialogue Overlay -->
  <Transition name="slide-up">
    <div v-if="isVisible" class="dialogue-overlay">

      <!--#region Dialogue Box -->
      <div class="dialogue-box">
        <div class="npc-name">{{ gameStore.npcName }}</div>

        <!--#region Loading -->
        <template v-if="isLoading">
          <div class="dialogue-text">
            <span class="loading-bar" />
            <span class="loading-bar loading-bar--short" />
          </div>
        </template>
        <!--#endregion -->

        <!--#region Question Phase -->
        <template v-else-if="gameStore.state === 'npc_question'">
          <div class="dialogue-text">{{ gameStore.npcText }}</div>
          <div class="answer-area">
            <input
              ref="inputEl"
              v-model="playerInput"
              type="text"
              class="player-input"
              placeholder="答えを入力..."
              @keydown.enter="submitAnswer"
              @keydown.escape="closeDialogue"
            />
            <button class="btn btn--send" @click="submitAnswer">送信</button>
          </div>
          <button class="btn btn--leave" @click="closeDialogue">立ち去る</button>
        </template>
        <!--#endregion -->

        <!--#region Verdict Phase -->
        <template v-else-if="gameStore.state === 'npc_verdict'">
          <div class="player-bubble">
            <span class="player-bubble__label">あなた</span>
            <span class="player-bubble__text">{{ gameStore.playerText }}</span>
          </div>
          <div class="dialogue-text">{{ gameStore.npcText }}</div>
          <div class="coin-result" :class="coinTierClass">
            <span class="coin-amount">{{ gameStore.lastCoins === 0 ? '±0' : `+${gameStore.lastCoins}` }}</span>
            <span class="coin-label">コイン</span>
          </div>
          <button class="btn btn--continue" @click="closeDialogue">続ける</button>
        </template>
        <!--#endregion -->

      </div>
      <!--#endregion Dialogue Box -->

      <!--#region Portrait -->
      <div class="portrait-container">
        <img
          :src="portrait"
          :alt="gameStore.emotion"
          class="portrait"
          :class="{ 'portrait--thinking': isLoading }"
        />
        <div v-if="isLoading" class="thinking-dots">
          <span /><span /><span />
        </div>
      </div>
      <!--#endregion Portrait -->

    </div>
  </Transition>
  <!--#endregion Dialogue Overlay -->
</template>

<style scoped>
.dialogue-overlay {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: flex-end;
  padding: 0 40px 28px;
  gap: 24px;
  background: linear-gradient(to top, rgba(10, 5, 25, 0.96) 60%, transparent);
  z-index: 100;
  pointer-events: all;
}

.portrait-container { position: relative; flex-shrink: 0; }

.portrait {
  width: 340px;
  height: 510px;
  object-fit: cover;
  object-position: top;
  border-radius: 12px 12px 0 0;
  border: 2px solid #7c3aed;
  box-shadow: 0 0 32px rgba(124, 58, 237, 0.6);
  transition: filter 0.3s ease;
}

.portrait--thinking { filter: brightness(0.7) saturate(0.6); }

.thinking-dots {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
}

.thinking-dots span {
  width: 8px;
  height: 8px;
  background: #e9d5ff;
  border-radius: 50%;
  animation: bounce 1.2s infinite ease-in-out;
}

.thinking-dots span:nth-child(2) { animation-delay: 0.2s; }
.thinking-dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}

.player-bubble {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 3px;
  padding: 8px 12px;
  background: rgba(49, 46, 129, 0.4);
  border: 1px solid rgba(99, 102, 241, 0.35);
  border-radius: 10px 10px 2px 10px;
  align-self: flex-end;
}

.player-bubble__label { font-family: monospace; font-size: 10px; letter-spacing: 1px; color: #818cf8; text-transform: uppercase; }
.player-bubble__text  { font-family: monospace; font-size: 14px; color: #c7d2fe; text-align: right; }

.dialogue-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px 24px;
  background: rgba(15, 8, 35, 0.92);
  border: 1px solid rgba(124, 58, 237, 0.4);
  border-radius: 12px;
  box-shadow: 0 0 30px rgba(124, 58, 237, 0.2);
  min-height: 140px;
}

.npc-name {
  font-family: monospace;
  font-size: 13px;
  color: #f0abfc;
  letter-spacing: 2px;
  text-transform: uppercase;
  border-bottom: 1px solid rgba(124, 58, 237, 0.3);
  padding-bottom: 6px;
}

.dialogue-text {
  font-family: monospace;
  font-size: 16px;
  color: #f1f5f9;
  line-height: 1.7;
  min-height: 48px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.loading-bar {
  height: 14px;
  background: linear-gradient(90deg, #4c1d95, #7c3aed, #4c1d95);
  background-size: 200% 100%;
  border-radius: 4px;
  animation: shimmer 1.4s infinite;
  width: 80%;
}

.loading-bar--short { width: 50%; }

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.answer-area { display: flex; gap: 8px; }

.player-input {
  flex: 1;
  background: rgba(30, 10, 60, 0.8);
  border: 1px solid rgba(124, 58, 237, 0.5);
  border-radius: 8px;
  padding: 8px 14px;
  color: #f1f5f9;
  font-family: monospace;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.player-input:focus { border-color: #a78bfa; }

.coin-result {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 10px;
  border: 1px solid transparent;
  animation: coinReveal 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
}

@keyframes coinReveal {
  from { transform: scale(0.7); opacity: 0; }
  to   { transform: scale(1);   opacity: 1; }
}

.coin-amount { font-family: monospace; font-size: 28px; font-weight: bold; letter-spacing: -1px; }
.coin-label  { font-family: monospace; font-size: 13px; letter-spacing: 2px; text-transform: uppercase; }

.coins--legendary { background: rgba(250, 204, 21, 0.12); border-color: rgba(250, 204, 21, 0.6); box-shadow: 0 0 24px rgba(250, 204, 21, 0.3); }
.coins--legendary .coin-amount { color: #fcd34d; }
.coins--legendary .coin-label  { color: #fbbf24; }

.coins--great { background: rgba(52, 211, 153, 0.1); border-color: rgba(52, 211, 153, 0.4); }
.coins--great .coin-amount { color: #6ee7b7; }
.coins--great .coin-label  { color: #34d399; }

.coins--good { background: rgba(96, 165, 250, 0.1); border-color: rgba(96, 165, 250, 0.35); }
.coins--good .coin-amount { color: #93c5fd; }
.coins--good .coin-label  { color: #60a5fa; }

.coins--weak { background: rgba(148, 163, 184, 0.08); border-color: rgba(148, 163, 184, 0.25); }
.coins--weak .coin-amount { color: #94a3b8; }
.coins--weak .coin-label  { color: #64748b; }

.coins--none { background: rgba(248, 113, 113, 0.08); border-color: rgba(248, 113, 113, 0.25); }
.coins--none .coin-amount { color: #f87171; }
.coins--none .coin-label  { color: #ef4444; }

.btn {
  font-family: monospace;
  font-size: 13px;
  padding: 9px 18px;
  border-radius: 8px;
  border: 1px solid rgba(124, 58, 237, 0.35);
  cursor: pointer;
  transition: all 0.18s;
  background: rgba(20, 8, 45, 0.75);
  color: #d8b4fe;
  text-align: left;
}

.btn:hover { background: rgba(124, 58, 237, 0.25); border-color: #a78bfa; color: #fff; box-shadow: 0 0 12px rgba(124, 58, 237, 0.25); }
.btn--send    { flex-shrink: 0; }
.btn--leave:hover { border-color: #f87171; color: #fecaca; background: rgba(248, 113, 113, 0.12); }
.btn--continue    { align-self: flex-start; }

.slide-up-enter-active,
.slide-up-leave-active { transition: transform 0.3s ease, opacity 0.3s ease; }
.slide-up-enter-from,
.slide-up-leave-to     { transform: translateY(100%); opacity: 0; }
</style>
