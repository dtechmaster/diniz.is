<script setup lang="ts">
//#region Meta
definePageMeta({ layout: false })
//#endregion

//#region Imports
import { ref, onMounted, onUnmounted } from 'vue'
import { gameStore } from '~/game/store'
//#endregion

//#region Fullscreen
const isFullscreen = ref(false)

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

function onFullscreenChange() {
  isFullscreen.value = !!document.fullscreenElement
}
//#endregion

//#region Game Setup
const gameContainer = ref<HTMLElement | null>(null)
let game: import('phaser').Game | null = null

onMounted(async function initGame() {
  document.addEventListener('fullscreenchange', onFullscreenChange)
  if (!gameContainer.value) return

  const Phaser = (await import('phaser')).default
  const { BootScene } = await import('~/game/BootScene')
  const { GameScene } = await import('~/game/GameScene')

  game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: gameContainer.value,
    width: 800,
    height: 600,
    backgroundColor: '#000',
    scene: [BootScene, GameScene],
    physics: {
      default: 'arcade',
      arcade: { debug: false },
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    pixelArt: true,
  })
})

onUnmounted(function destroyGame() {
  document.removeEventListener('fullscreenchange', onFullscreenChange)
  game?.destroy(true)
  game = null
})
//#endregion
</script>

<template>
  <!--#region Game Wrapper -->
  <div class="game-wrapper">
    <div ref="gameContainer" id="game-container" />
    <RpgDialogueUI />

    <!--#region Coin HUD -->
    <div class="coin-hud">
      <span class="coin-hud__label">コイン</span>
      <span class="coin-hud__value">{{ gameStore.coins }}</span>
    </div>
    <!--#endregion -->

    <!--#region Trademark -->
    <div class="trademark">© Diniz Vitor — All rights reserved</div>
    <!--#endregion -->

    <!--#region Fullscreen Button -->
    <button class="fullscreen-btn" :title="isFullscreen ? '縮小' : '全画面'" @click="toggleFullscreen">
      <svg v-if="!isFullscreen" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
      </svg>
      <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
      </svg>
    </button>
    <!--#endregion -->

  </div>
  <!--#endregion -->
</template>

<style scoped>
.game-wrapper {
  width: 100vw;
  height: 100vh;
  background: #0d0d1a;
  overflow: hidden;
  position: relative;
}

#game-container {
  width: 100%;
  height: 100%;
}

.fullscreen-btn {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 50;
  width: 36px;
  height: 36px;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(10, 5, 25, 0.88);
  border: 1px solid rgba(124, 58, 237, 0.35);
  border-radius: 8px;
  color: #a78bfa;
  cursor: pointer;
  transition: all 0.15s;
  backdrop-filter: blur(6px);
}

.fullscreen-btn:hover {
  background: rgba(124, 58, 237, 0.2);
  border-color: #a78bfa;
  color: #fff;
}

.fullscreen-btn svg { width: 100%; height: 100%; }

.coin-hud {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 50;
  display: flex;
  align-items: baseline;
  gap: 6px;
  padding: 7px 14px;
  background: rgba(10, 5, 25, 0.88);
  border: 1px solid rgba(250, 204, 21, 0.35);
  border-radius: 8px;
  backdrop-filter: blur(6px);
  pointer-events: none;
}

.coin-hud__label { font-family: monospace; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #fbbf24; }
.coin-hud__value { font-family: monospace; font-size: 18px; font-weight: bold; color: #fcd34d; min-width: 2ch; text-align: right; }

.trademark {
  position: fixed;
  bottom: 12px;
  right: 16px;
  z-index: 50;
  font-family: monospace;
  font-size: 10px;
  letter-spacing: 0.5px;
  color: rgba(233, 213, 255, 0.85);
  pointer-events: none;
  user-select: none;
}
</style>
