// src/game/ExplorationScene.ts — ONE reusable Phaser scene that plays EVERY stage.
// The stage config (from src/data/missions.ts) decides the art theme, items, targets and hazards.
import Phaser from 'phaser'; // the 2D game engine
import type { Stage, SceneTheme } from '../types'; // stage + theme types
import { bridge, virtualInput } from './bridge'; // React ⇄ Phaser messages and touch input

export interface SceneData { // data passed in when the scene starts
  stage: Stage; // which stage to play
  suit: string; visor: string; // avatar colours (cosmetic only)
  upgrades: { oxygen: number; suit: number; thrusters: number }; // upgrade levels
  demo: boolean; // demo mode = fewer items to collect
  reducedMotion: boolean; // fewer animations
  tutorial: boolean; // show beginner hints
}

const W = 1600, H = 1000; // size of the playable world in pixels

interface Item { obj: Phaser.GameObjects.Container; kind: 'part' | 'oxygen'; taken: boolean } // a collectible on the map
interface Target { obj: Phaser.GameObjects.Container; def: Stage['targets'][number]; done: boolean; ring: Phaser.GameObjects.Arc } // an interaction point
interface Hazard { obj: Phaser.GameObjects.Container; vx: number; vy: number } // a moving danger

const PALETTE: Record<SceneTheme, { sky: [number, number]; ground: number; accent: number }> = { // colours per theme
  earth: { sky: [0x0b2a5a, 0x3f8fd8], ground: 0x2e6b3a, accent: 0x7fd3ff }, // blue sky, green ground
  moon: { sky: [0x02040c, 0x0a1022], ground: 0x8d929c, accent: 0xd9dde5 }, // black sky, silver ground
  mars: { sky: [0x3a1a14, 0xc9774f], ground: 0xa8492b, accent: 0xe08a5a }, // butterscotch sky, rust ground
  venus: { sky: [0x5a3200, 0xe0a540], ground: 0x6b5a48, accent: 0xffd28a }, // amber haze, metal platform
  saturn: { sky: [0x03050f, 0x0d1530], ground: 0x2a3550, accent: 0xe8d39a }, // deep space, station deck
  sun: { sky: [0x050208, 0x1a0d10], ground: 0x2b2f3d, accent: 0xffb347 }, // dark space, observation deck
  asteroid: { sky: [0x02030a, 0x0b0f1f], ground: 0x5d5148, accent: 0xc9a27e }, // dark space, brown rock
  comet: { sky: [0x020612, 0x0b1a33], ground: 0x8fb5c9, accent: 0xbfe9ff }, // icy blues
  exoplanet: { sky: [0x0c0420, 0x2a0f45], ground: 0x2d2350, accent: 0xff8fb1 }, // violet alien sky
  orbit: { sky: [0x01030b, 0x061433], ground: 0x1d2a44, accent: 0x9fe8ff }, // Earth orbit
};

export class ExplorationScene extends Phaser.Scene { // our scene class
  private cfg!: SceneData; // current configuration ("!" = set in init)
  private player!: Phaser.GameObjects.Container; // the astronaut
  private items: Item[] = []; // collectibles
  private targets: Target[] = []; // interaction points
  private hazards: Hazard[] = []; // moving dangers
  private keys!: Record<'up' | 'down' | 'left' | 'right' | 'w' | 'a' | 's' | 'd' | 'e' | 'space' | 'esc', Phaser.Input.Keyboard.Key>; // keyboard keys
  private res = { oxygen: 100, fuel: 100, health: 100, suit: 100 }; // resources (percent)
  private collected = 0; // parts collected so far
  private needed = 0; // parts required
  private hitCooldown = 0; // ms until the next hazard hit can happen
  private hudTimer = 0; // ms since the last HUD update
  private finished = false; // objectives complete?
  private failed = false; // resource depleted?
  private droneSpin = 0; // drone animation angle
  private prompt = ''; // "Press E…" text for the HUD
  private hintStep = 0; // tutorial progress
  private unsubs: (() => void)[] = []; // bridge listeners to remove on shutdown

  constructor() { super('explore'); } // register the scene with the key "explore"

  init(data: SceneData): void { // runs first, every time the scene (re)starts
    this.cfg = data; // store the configuration
    this.items = []; this.targets = []; this.hazards = []; // clear old objects
    this.res = { oxygen: 100, fuel: 100, health: 100, suit: 100 }; // full resources
    this.collected = 0; this.finished = false; this.failed = false; this.hitCooldown = 0; this.hintStep = 0; // reset counters
    this.needed = data.demo ? 2 : data.stage.collectible.count; // demo mode shortens exploration (quiz rules unchanged)
  }

  create(): void { // build the world
    const { stage } = this.cfg; // shortcut
    const pal = PALETTE[stage.theme]; // colours for this theme
    this.cameras.main.setBounds(0, 0, W, H); // camera cannot leave the world
    this.paintBackdrop(stage.theme, pal); // draw sky, planets, ground
    const rnd = new Phaser.Math.RandomDataGenerator([stage.title]); // seeded random → same layout every time for this stage
    const spot = (minDist = 160) => { // find a random free position away from the start point
      for (let i = 0; i < 50; i++) { // try up to 50 times
        const x = rnd.between(120, W - 120), y = rnd.between(260, H - 100); // random point inside the play area
        if (Phaser.Math.Distance.Between(x, y, 200, H - 200) > minDist) return { x, y }; // far enough from start
      }
      return { x: W / 2, y: H / 2 }; // fallback: centre
    };
    for (let i = 0; i < this.needed; i++) { const p = spot(); this.items.push({ obj: this.makeItem(p.x, p.y, stage.collectible.color, stage.collectible.label), kind: 'part', taken: false }); } // place parts
    for (let i = 0; i < 2; i++) { const p = spot(); this.items.push({ obj: this.makeItem(p.x, p.y, 0x4fe3ff, 'O₂ refill', true), kind: 'oxygen', taken: false }); } // two oxygen refills (forgiving)
    stage.targets.forEach((def, i) => { // place each target in order, left → right
      const x = 520 + i * 360, y = 380 + (i % 2) * 260; // spread them out
      const ring = this.add.circle(x, y, 56, pal.accent, 0.12).setStrokeStyle(3, pal.accent, 0.8); // glowing ring
      const obj = this.makeTarget(x, y, def.label, def.kind ?? 'normal'); // the object itself
      this.targets.push({ obj, def, done: false, ring }); // remember it
    });
    for (let i = 0; i < (this.cfg.demo ? 1 : stage.hazards); i++) { // hazards (fewer in demo mode)
      const p = spot(260); const c = this.add.container(p.x, p.y); // container at a random spot
      c.add(this.add.circle(0, 0, 22, 0xff5d5d, 0.25)); c.add(this.add.circle(0, 0, 12, 0xff8f6b, 0.9)); // red glow + core
      c.add(this.add.text(0, -34, stage.hazardLabel, { fontFamily: 'sans-serif', fontSize: '14px', color: '#ffb3b3' }).setOrigin(0.5)); // label
      this.hazards.push({ obj: c, vx: rnd.realInRange(-70, 70), vy: rnd.realInRange(-55, 55) }); // random drift speed
    }
    this.player = this.makeAstronaut(200, H - 200); // create the astronaut at the start point
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12); // camera smoothly follows the player
    if (this.scale.width < 700) this.cameras.main.setZoom(0.75); // zoom out a little on phones so players see more of the map
    const kb = this.input.keyboard!; // keyboard plugin
    const K = Phaser.Input.Keyboard.KeyCodes; // key code names
    this.keys = { up: kb.addKey(K.UP), down: kb.addKey(K.DOWN), left: kb.addKey(K.LEFT), right: kb.addKey(K.RIGHT), w: kb.addKey(K.W), a: kb.addKey(K.A), s: kb.addKey(K.S), d: kb.addKey(K.D), e: kb.addKey(K.E), space: kb.addKey(K.SPACE), esc: kb.addKey(K.ESC) }; // register keys
    kb.addCapture([K.UP, K.DOWN, K.LEFT, K.RIGHT, K.SPACE]); // stop the page scrolling when these are pressed
    this.unsubs.push(bridge.on('pause', () => this.scene.pause())); // React asked to pause → freeze everything (timers + depletion stop)
    this.unsubs.push(bridge.on('resume', () => this.scene.resume())); // React asked to resume
    this.unsubs.push(bridge.on('puzzle-solved', () => this.completeTarget(this.targets.find((t) => t.def.kind === 'puzzle' && !t.done)))); // energy puzzle solved
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => { this.unsubs.forEach((u) => u()); this.unsubs = []; }); // clean up listeners when the scene stops
    if (this.cfg.tutorial) bridge.emit('hint', 'Tutorial: move with WASD / arrow keys (or the on-screen pad).'); // first tutorial hint
    else bridge.emit('hint', `Objective: ${stage.objective}`); // normal start message
  }

  private paintBackdrop(theme: SceneTheme, pal: (typeof PALETTE)[SceneTheme]): void { // procedural art (no external images needed)
    const g = this.add.graphics(); // drawing tool
    g.fillGradientStyle(pal.sky[0], pal.sky[0], pal.sky[1], pal.sky[1], 1); g.fillRect(0, 0, W, 260); // sky band with a gradient
    const sky = this.add.graphics().setScrollFactor(0.3); // parallax layer (moves slower than the ground)
    for (let i = 0; i < 160; i++) sky.fillStyle(0xffffff, Math.random() * 0.8 + 0.2).fillCircle(Math.random() * W, Math.random() * 300, Math.random() * 1.6 + 0.3); // stars
    if (theme === 'moon') { sky.fillStyle(0x2f6fd0).fillCircle(1100, 120, 60); sky.fillStyle(0x3fa66b).fillCircle(1085, 105, 22).fillCircle(1120, 140, 16); sky.fillStyle(0x000000, 0.45).fillCircle(1130, 120, 60); } // Earthrise
    if (theme === 'mars') { sky.fillStyle(0x7a3a24).fillTriangle(800, 260, 1050, 140, 1300, 260); sky.fillStyle(0xd9c7a0).fillCircle(300, 80, 10); } // Olympus Mons silhouette + Phobos
    if (theme === 'venus') { for (let i = 0; i < 6; i++) sky.fillStyle(0xffc46b, 0.18).fillEllipse(200 + i * 260, 120 + (i % 2) * 60, 420, 80); } // amber cloud haze
    if (theme === 'saturn') { sky.fillStyle(0xd8b878).fillCircle(1150, 130, 85); sky.lineStyle(10, 0xe8d39a, 0.8).strokeEllipse(1150, 130, 320, 60); sky.lineStyle(4, 0xb39a6a, 0.6).strokeEllipse(1150, 130, 360, 74); } // Saturn + rings
    if (theme === 'sun') { sky.fillStyle(0xff9a3c, 0.25).fillCircle(1250, 140, 150); sky.fillStyle(0xffb347).fillCircle(1250, 140, 95); sky.fillStyle(0x000000, 0.35).fillRect(1100, 0, 300, 300); sky.lineStyle(4, 0x9aa3b5).strokeRect(1100, 10, 300, 260); } // Sun seen through a filtered viewport
    if (theme === 'comet') { sky.fillStyle(0xbfe9ff, 0.12).fillTriangle(900, 140, 1600, 40, 1600, 240); sky.fillStyle(0xe8f7ff).fillCircle(900, 140, 26); } // comet coma + tail
    if (theme === 'exoplanet') { sky.fillStyle(0xff8f6b).fillCircle(300, 90, 34); sky.fillStyle(0x5a3fa0).fillCircle(1150, 160, 110); sky.fillStyle(0x7fd8c8, 0.4).fillEllipse(1150, 150, 210, 40); } // alien star + planet
    if (theme === 'orbit') { sky.fillStyle(0x1f5fbf).fillCircle(800, 900, 700); sky.fillStyle(0x3fa66b, 0.7).fillEllipse(600, 300, 300, 80); sky.fillStyle(0x9fe8ff, 0.25).fillCircle(800, 900, 715); } // Earth from orbit
    if (theme === 'asteroid') { for (let i = 0; i < 8; i++) sky.fillStyle(0x6d6157).fillCircle(Math.random() * W, Math.random() * 240, Math.random() * 14 + 4); } // distant rocks
    const ground = this.add.graphics(); // playable surface
    const floating = this.cfg.stage.floating; // orbital/flyby scenes use a station deck instead of ground
    ground.fillStyle(pal.ground, floating ? 0.55 : 1).fillRect(0, 260, W, H - 260); // floor / deck
    if (floating) { for (let x = 0; x < W; x += 80) ground.lineStyle(1, pal.accent, 0.18).lineBetween(x, 260, x, H); for (let y = 260; y < H; y += 80) ground.lineStyle(1, pal.accent, 0.18).lineBetween(0, y, W, y); } // deck grid
    else { for (let i = 0; i < 40; i++) { const x = Math.random() * W, y = 300 + Math.random() * (H - 320), r = Math.random() * 30 + 8; ground.fillStyle(0x000000, 0.18).fillEllipse(x, y, r * 2, r); ground.lineStyle(2, 0xffffff, 0.08).strokeEllipse(x, y - 2, r * 2, r); } } // craters / rocks
    this.add.text(W - 20, H - 20, 'Illustrative · Simulation scene', { fontFamily: 'sans-serif', fontSize: '14px', color: '#9fb3d9' }).setOrigin(1, 1); // honesty label in the world
  }

  private makeAstronaut(x: number, y: number): Phaser.GameObjects.Container { // draw the astronaut (helmet, visor, backpack, gloves, boots)
    const suit = Phaser.Display.Color.HexStringToColor(this.cfg.suit).color; // suit colour as a number
    const visor = Phaser.Display.Color.HexStringToColor(this.cfg.visor).color; // visor colour
    const c = this.add.container(x, y); // group of shapes
    c.add(this.add.ellipse(0, 34, 40, 10, 0x000000, 0.3)); // shadow
    c.add(this.add.rectangle(-16, -2, 12, 26, 0xc9d1de).setStrokeStyle(2, 0x1b2233)); // backpack
    c.add(this.add.rectangle(0, 4, 26, 30, suit).setStrokeStyle(2, 0x1b2233)); // body (suit colour)
    c.add(this.add.rectangle(-8, 26, 9, 12, suit).setStrokeStyle(2, 0x1b2233)); c.add(this.add.rectangle(8, 26, 9, 12, suit).setStrokeStyle(2, 0x1b2233)); // legs
    c.add(this.add.rectangle(-8, 33, 11, 5, 0x3a3f4b)); c.add(this.add.rectangle(8, 33, 11, 5, 0x3a3f4b)); // boots
    c.add(this.add.circle(-17, 10, 5, 0xffffff).setStrokeStyle(2, 0x1b2233)); c.add(this.add.circle(17, 10, 5, 0xffffff).setStrokeStyle(2, 0x1b2233)); // gloves
    c.add(this.add.circle(0, -18, 15, 0xf2f5fa).setStrokeStyle(2, 0x1b2233)); // helmet
    c.add(this.add.ellipse(3, -18, 18, 12, visor)); // visor
    c.add(this.add.ellipse(7, -21, 5, 3, 0xffffff, 0.7)); // visor shine
    if (!this.cfg.reducedMotion) this.tweens.add({ targets: c.list, y: '-=2', yoyo: true, repeat: -1, duration: 900, ease: 'Sine.inOut' }); // gentle floating bob
    return c; // the finished astronaut
  }

  private makeItem(x: number, y: number, color: number, label: string, small = false): Phaser.GameObjects.Container { // draw a collectible
    const c = this.add.container(x, y); // group
    c.add(this.add.circle(0, 0, small ? 16 : 20, color, 0.25)); // glow
    c.add(this.add.rectangle(0, 0, small ? 12 : 16, small ? 12 : 16, color).setAngle(45).setStrokeStyle(2, 0xffffff, 0.8)); // diamond gem
    c.add(this.add.text(0, -30, label, { fontFamily: 'sans-serif', fontSize: '13px', color: '#e6f4ff' }).setOrigin(0.5)); // label
    if (!this.cfg.reducedMotion) this.tweens.add({ targets: c, scale: 1.12, yoyo: true, repeat: -1, duration: 700 }); // pulse
    return c; // finished item
  }

  private makeTarget(x: number, y: number, label: string, kind: string): Phaser.GameObjects.Container { // draw a target
    const c = this.add.container(x, y); // group
    if (kind === 'drone') { // the rogue drone (family-friendly)
      c.add(this.add.circle(0, 0, 22, 0x8a93a8).setStrokeStyle(3, 0xff5d5d)); c.add(this.add.circle(0, 0, 7, 0xff5d5d)); // body + red eye
      c.add(this.add.rectangle(-30, 0, 18, 4, 0xc9d1de)); c.add(this.add.rectangle(30, 0, 18, 4, 0xc9d1de)); // little arms
    } else { // a machine / console
      c.add(this.add.rectangle(0, 0, 70, 50, 0x26324d).setStrokeStyle(3, 0x9fe8ff)); // box
      c.add(this.add.rectangle(0, -6, 46, 16, 0x0c1426)); c.add(this.add.circle(-20, 14, 4, 0xff5d5d)); c.add(this.add.circle(-6, 14, 4, 0xffc857)); // screen + status lights
    }
    c.add(this.add.text(0, -46, label, { fontFamily: 'sans-serif', fontSize: '15px', color: '#ffffff', backgroundColor: '#0b1430aa', padding: { x: 6, y: 2 } }).setOrigin(0.5)); // label
    return c; // finished target
  }

  update(_time: number, delta: number): void { // runs every frame (~60 times per second)
    if (this.finished || this.failed) return; // nothing to do once the stage ends
    const dt = delta / 1000; // seconds since last frame
    const k = this.keys; // shortcut
    let dx = (k.left.isDown || k.a.isDown ? -1 : 0) + (k.right.isDown || k.d.isDown ? 1 : 0) + virtualInput.x; // horizontal input (keys + touch)
    let dy = (k.up.isDown || k.w.isDown ? -1 : 0) + (k.down.isDown || k.s.isDown ? 1 : 0) + virtualInput.y; // vertical input
    const len = Math.hypot(dx, dy); if (len > 1) { dx /= len; dy /= len; } // keep diagonal speed equal
    const speed = (this.res.fuel > 0 ? 230 : 120) + this.cfg.upgrades.thrusters * 25; // slower when fuel is empty; thrusters upgrade helps
    this.player.x = Phaser.Math.Clamp(this.player.x + dx * speed * dt, 40, W - 40); // move horizontally, stay inside the world
    this.player.y = Phaser.Math.Clamp(this.player.y + dy * speed * dt, 280, H - 40); // move vertically, stay on the surface/deck
    if (len > 0.1) this.player.setScale(dx < 0 ? -1 : dx > 0 ? 1 : this.player.scaleX, 1); // face the walking direction
    this.res.oxygen = Math.max(0, this.res.oxygen - dt * (100 / (100 + this.cfg.upgrades.oxygen * 25))); // oxygen drains slowly (~100 s; upgrades slow it)
    if (len > 0.1) this.res.fuel = Math.max(0, this.res.fuel - dt * 0.8); // fuel drains only while moving
    if (this.res.oxygen <= 0 || this.res.suit <= 0) this.res.health = Math.max(0, this.res.health - dt * 6); // health drops only when oxygen or suit fail
    if (this.res.health <= 0) { this.failed = true; bridge.emit('depleted', this.res.oxygen <= 0 ? 'Oxygen depleted' : 'Suit integrity lost'); return; } // forgiving failure → restart activity
    this.hazards.forEach((h) => { // move hazards and check hits
      h.obj.x += h.vx * dt; h.obj.y += h.vy * dt; // drift
      if (h.obj.x < 60 || h.obj.x > W - 60) h.vx *= -1; if (h.obj.y < 290 || h.obj.y > H - 60) h.vy *= -1; // bounce at edges
      if (this.hitCooldown <= 0 && Phaser.Math.Distance.Between(h.obj.x, h.obj.y, this.player.x, this.player.y) < 34) { // touching the player?
        this.res.suit = Math.max(0, this.res.suit - Math.max(4, 12 - this.cfg.upgrades.suit * 2)); // suit damage (suit upgrade reduces it)
        this.hitCooldown = 1200; bridge.emit('sfx', 'hit'); // short invulnerability + sound
        if (!this.cfg.reducedMotion) this.cameras.main.shake(120, 0.004); // tiny, gentle shake (off in reduced motion)
      }
    });
    this.hitCooldown -= delta; // count down the cooldown
    this.items.forEach((it) => { // pick up items by walking into them
      if (it.taken || Phaser.Math.Distance.Between(it.obj.x, it.obj.y, this.player.x, this.player.y) > 34) return; // too far
      it.taken = true; it.obj.destroy(); bridge.emit('sfx', 'collect'); // remove + sound
      if (it.kind === 'oxygen') { this.res.oxygen = Math.min(100, this.res.oxygen + 40); bridge.emit('hint', 'Oxygen refilled +40%.'); } // refill
      else { this.collected++; if (this.cfg.tutorial && this.hintStep < 2) { this.hintStep = 2; bridge.emit('hint', `Tutorial: great! Collect all ${this.needed}, then walk to the glowing target and press E (or the ✋ button).`); } } // count a part
    });
    const active = this.targets.find((t) => !t.done); // the next unfinished target (they run in order)
    this.targets.forEach((t) => t.ring.setAlpha(t === active ? 1 : 0.25)); // highlight only the active one
    this.prompt = ''; // reset the prompt
    if (active) { // there is still something to do
      if (active.def.kind === 'drone') { this.droneSpin += dt * 3; active.obj.x += Math.cos(this.droneSpin) * 1.5; active.obj.angle += 4; } // rogue drone spins around
      const near = Phaser.Math.Distance.Between(active.obj.x, active.obj.y, this.player.x, this.player.y) < 90; // close enough to interact?
      if (near) { // show the right prompt
        const ready = this.collected >= Math.min(active.def.needs, this.needed); // enough parts?
        this.prompt = ready ? `Press E: ${active.def.action}` : `Need ${Math.min(active.def.needs, this.needed) - this.collected} more ${this.cfg.stage.collectible.label}`; // text
        const pressed = Phaser.Input.Keyboard.JustDown(this.keys.e) || Phaser.Input.Keyboard.JustDown(this.keys.space) || virtualInput.interact; // interact pressed?
        if (pressed) { // try to interact
          if (!ready) bridge.emit('sfx', 'deny'); // not enough parts
          else if (active.def.kind === 'puzzle') { this.scene.pause(); bridge.emit('puzzle', null); } // open the React puzzle and freeze the scene
          else this.completeTarget(active); // finish this target
        }
      }
    }
    virtualInput.interact = false; // a tap counts only once
    if (Phaser.Input.Keyboard.JustDown(this.keys.esc)) bridge.emit('esc', null); // Escape → pause menu
    this.hudTimer += delta; // throttle HUD updates
    if (this.hudTimer > 150) { this.hudTimer = 0; bridge.emit('hud', { ...this.res, collected: this.collected, needed: this.needed, objective: this.cfg.stage.objective, prompt: this.prompt }); } // send HUD data ~7×/second
  }

  private completeTarget(t: Target | undefined): void { // mark a target done
    if (!t || t.done) return; // nothing / already done
    t.done = true; bridge.emit('sfx', 'interact'); // remember + sound
    t.ring.setFillStyle(0x7dff9a, 0.25).setStrokeStyle(3, 0x7dff9a, 1); // turn the ring green
    if (t.def.kind === 'drone') { t.obj.angle = 0; (t.obj.list[0] as Phaser.GameObjects.Arc).setStrokeStyle(3, 0x7dff9a); (t.obj.list[1] as Phaser.GameObjects.Arc).setFillStyle(0x7dff9a); bridge.emit('hint', 'The drone blinks green and waves its little arms. Friend restored! (Simulation Fiction)'); } // calm, friendly drone
    else bridge.emit('hint', `${t.def.action}: complete ✓`); // success message
    if (this.scene.isPaused()) this.scene.resume(); // un-freeze after the puzzle
    if (this.targets.every((x) => x.done)) { // all targets done?
      this.finished = true; // stop updates
      bridge.emit('hud', { ...this.res, collected: this.collected, needed: this.needed, objective: 'Objectives complete!', prompt: '' }); // final HUD
      this.time.delayedCall(900, () => bridge.emit('exploration-complete', null)); // short pause, then go to the checkpoint
    }
  }
}
