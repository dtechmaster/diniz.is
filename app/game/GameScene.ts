import Phaser from 'phaser'
import { gameStore } from './store'
import { Player } from './Player'
import { NPC } from './NPC'
import { generateNPCConfigs, NPC_COUNT } from './npcFactory'

// #region Constants

const TILESET_NAME = 'tuxemon-sample-32px-extruded'

const PLAYER_SPAWN_X = 352
const PLAYER_SPAWN_Y = 1216
const SPAWN_CLEAR_RADIUS = 128
const MIN_NPC_SPACING = 64
const HINT_RANGE = 80

// #endregion

// #region GameScene

export class GameScene extends Phaser.Scene {
  private player!: Player
  private worldLayer!: Phaser.Tilemaps.TilemapLayer
  private hintText!: Phaser.GameObjects.Text
  private npcs: NPC[] = []
  private wasInDialogue = false

  constructor() {
    super({ key: 'GameScene' })
  }

  // #region Create

  create() {
    this.buildMap()
    this.buildNPCs()
    this.buildPlayer()
    this.buildHint()
    this.setupNPCInteractions()
  }

  private buildMap() {
    const tilemap = this.make.tilemap({ key: 'map' })
    const tileset = tilemap.addTilesetImage(TILESET_NAME, 'tiles')!

    tilemap.createLayer('Below Player', tileset, 0, 0)
    this.worldLayer = tilemap.createLayer('World', tileset, 0, 0)!
    const aboveLayer = tilemap.createLayer('Above Player', tileset, 0, 0)!

    this.worldLayer.setCollisionByProperty({ collides: true })

    this.physics.world.setBounds(0, 0, this.worldLayer.width, this.worldLayer.height)

    aboveLayer.setDepth(10)

    this.cameras.main.setBounds(0, 0, tilemap.widthInPixels, tilemap.heightInPixels)
  }

  private buildNPCs() {
    const configs = generateNPCConfigs(NPC_COUNT)
    const occupied: Phaser.Math.Vector2[] = []

    for (const config of configs) {
      const pos = this.findValidSpawn(occupied)
      if (!pos) continue

      occupied.push(pos)

      const npc = new NPC(this, pos.x, pos.y, config.name, config.personality)
      this.physics.add.collider(npc, this.worldLayer)
      this.npcs.push(npc)
    }
  }

  private findValidSpawn(occupied: Phaser.Math.Vector2[]): Phaser.Math.Vector2 | null {
    const map = this.worldLayer.tilemap

    for (let attempt = 0; attempt < 300; attempt++) {
      const tileX = Phaser.Math.Between(2, map.width - 3)
      const tileY = Phaser.Math.Between(2, map.height - 3)

      const tile = this.worldLayer.getTileAt(tileX, tileY)
      if (tile?.collides) continue

      const wx = tileX * map.tileWidth + map.tileWidth / 2
      const wy = tileY * map.tileHeight + map.tileHeight / 2

      if (Phaser.Math.Distance.Between(wx, wy, PLAYER_SPAWN_X, PLAYER_SPAWN_Y) < SPAWN_CLEAR_RADIUS) continue

      const tooClose = occupied.some(
        p => Phaser.Math.Distance.Between(wx, wy, p.x, p.y) < MIN_NPC_SPACING,
      )
      if (tooClose) continue

      return new Phaser.Math.Vector2(wx, wy)
    }

    return null
  }

  private buildPlayer() {
    this.player = new Player(this, PLAYER_SPAWN_X, PLAYER_SPAWN_Y)
    this.physics.add.collider(this.player, this.worldLayer)
  }

  private buildHint() {
    this.hintText = this.add
      .text(400, 520, '[ E ] 話しかける', {
        fontSize: '14px',
        color: '#e9d5ff',
        fontFamily: 'monospace',
        backgroundColor: '#1a0a2ecc',
        padding: { x: 12, y: 5 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(20)
      .setVisible(false)
  }

  private setupNPCInteractions() {
    type Body = Phaser.Types.Physics.Arcade.ArcadeColliderType

    for (const npc of this.npcs) {
      this.physics.add.overlap(
        npc,
        this.player.selector as unknown as Body,
        () => this.onNearNPC(npc),
        undefined,
        this,
      )
    }
  }

  // #endregion

  // #region Update

  update(_time: number, delta: number) {
    const inDialogue =
      gameStore.state === 'interacting' ||
      gameStore.state === 'waiting_llm' ||
      gameStore.state === 'npc_question' ||
      gameStore.state === 'npc_verdict'

    if (this.wasInDialogue && !inDialogue) {
      this.wasInDialogue = false
    }

    if (inDialogue) {
      this.wasInDialogue = true
      this.hintText.setVisible(false)
      return
    }

    if (Phaser.Input.Keyboard.JustDown(this.player.escKey) && gameStore.state !== 'idle') {
      gameStore.state = 'idle'
      return
    }

    this.player.update()

    for (const npc of this.npcs) {
      npc.update(delta, this.player.x, this.player.y)
    }

    this.updateProximityHint()
  }

  private onNearNPC(npc: NPC) {
    if (gameStore.state === 'idle' || gameStore.state === 'near_npc') {
      gameStore.npcName = npc.npcName
      gameStore.personality = npc.personality

      if (gameStore.state !== 'near_npc') gameStore.state = 'near_npc'
      this.hintText.setVisible(true)

      if (Phaser.Input.Keyboard.JustDown(this.player.interactKey)) {
        gameStore.state = 'interacting'
        this.hintText.setVisible(false)
      }
    }
  }

  private updateProximityHint() {
    const nearAny = this.npcs.some(
      npc =>
        Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.x, npc.y) <=
        HINT_RANGE + 20,
    )

    if (!nearAny) {
      this.hintText.setVisible(false)
      if (gameStore.state === 'near_npc') gameStore.state = 'idle'
    }
  }

  // #endregion
}

// #endregion
