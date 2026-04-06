import Phaser from 'phaser'
import type { Personality } from './types'

//#region Constants
const NPC_SPEED = 60
const WANDER_MIN_MS = 1500
const WANDER_MAX_MS = 4000
const PLAYER_STOP_RANGE = 52
//#endregion

//#region NPC
export class NPC extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body

  readonly npcName: string
  readonly personality: Personality
  private label!: Phaser.GameObjects.Text

  private dirX = 0
  private dirY = 0
  private wanderTimer = 0

  constructor(scene: Phaser.Scene, x: number, y: number, name: string, personality: Personality) {
    super(scene, x, y, 'player', 'misa-front')
    this.npcName = name
    this.personality = personality

    scene.add.existing(this)
    scene.physics.world.enable(this)

    this.setTint(0xff9de2)
    this.setSize(32, 42).setOffset(0, 22)
    this.setCollideWorldBounds(true)
    this.setDepth(5)

    this.label = scene.add
      .text(x, y - 36, name, {
        fontSize: '11px',
        color: '#f0abfc',
        fontFamily: 'monospace',
        backgroundColor: '#0d0a1ecc',
        padding: { x: 5, y: 2 },
      })
      .setOrigin(0.5)
      .setDepth(6)

    this.pickNewDirection()
  }

  update(delta: number, playerX: number, playerY: number) {
    this.wanderTimer -= delta

    if (this.wanderTimer <= 0 || this.isBlocked()) {
      this.pickNewDirection()
    }

    if (this.playerInFront(playerX, playerY)) {
      this.body.setVelocity(0, 0)
    } else {
      this.body.setVelocity(this.dirX * NPC_SPEED, this.dirY * NPC_SPEED)
    }

    if      (this.dirX < 0) this.setTexture('player', 'misa-left')
    else if (this.dirX > 0) this.setTexture('player', 'misa-right')
    else if (this.dirY < 0) this.setTexture('player', 'misa-back')
    else if (this.dirY > 0) this.setTexture('player', 'misa-front')

    this.label.setPosition(this.x, this.y - 36)
  }

  private isBlocked(): boolean {
    const b = this.body.blocked
    return (this.dirX < 0 && b.left)
        || (this.dirX > 0 && b.right)
        || (this.dirY < 0 && b.up)
        || (this.dirY > 0 && b.down)
  }

  private playerInFront(px: number, py: number): boolean {
    if (this.dirX === 0 && this.dirY === 0) return false
    const dx = px - this.x
    const dy = py - this.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist > PLAYER_STOP_RANGE) return false
    const dot = (dx * this.dirX + dy * this.dirY) / dist
    return dot > 0.5
  }

  private pickNewDirection() {
    const dirs = [
      { x: 1,  y: 0 },
      { x: -1, y: 0 },
      { x: 0,  y: 1 },
      { x: 0,  y: -1 },
      { x: 0,  y: 0 },
    ]
    const d = Phaser.Utils.Array.GetRandom(dirs)
    this.dirX = d.x
    this.dirY = d.y
    this.wanderTimer = Phaser.Math.Between(WANDER_MIN_MS, WANDER_MAX_MS)
  }
}
//#endregion
