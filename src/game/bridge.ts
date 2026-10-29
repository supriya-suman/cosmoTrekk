// src/game/bridge.ts — the React ⇄ Phaser "event bridge".
// Phaser (the game canvas) and React (menus/HUD) never call each other directly.
// Instead they send named messages through this tiny event emitter. This keeps them cleanly separated.

export interface HudData { oxygen: number; fuel: number; health: number; suit: number; collected: number; needed: number; objective: string; prompt: string } // HUD numbers

export interface BridgeEvents { // every message and the data it carries
  hud: HudData; // Phaser → React: resource levels and objective
  hint: string; // Phaser → React: tutorial / mission-control message
  puzzle: null; // Phaser → React: open the energy-routing puzzle
  'puzzle-solved': null; // React → Phaser: puzzle finished
  'exploration-complete': null; // Phaser → React: all objectives done
  depleted: string; // Phaser → React: a resource ran out (reason text)
  pause: null; // React → Phaser: freeze the scene
  resume: null; // React → Phaser: unfreeze the scene
  esc: null; // Phaser → React: Escape key pressed
  sfx: 'collect' | 'interact' | 'hit' | 'deny'; // Phaser → React: play a sound effect
}

type Handler<T> = (data: T) => void; // a listener function

class Bridge { // minimal typed emitter
  private handlers = new Map<keyof BridgeEvents, Set<Handler<never>>>(); // listeners per event name

  on<K extends keyof BridgeEvents>(event: K, fn: Handler<BridgeEvents[K]>): () => void { // subscribe; returns an "unsubscribe" function
    if (!this.handlers.has(event)) this.handlers.set(event, new Set()); // create the set if missing
    const set = this.handlers.get(event) as Set<Handler<BridgeEvents[K]>>; // listeners for this event
    set.add(fn); // remember the listener
    return () => { set.delete(fn); }; // call this to stop listening (prevents memory leaks)
  }

  emit<K extends keyof BridgeEvents>(event: K, data: BridgeEvents[K]): void { // send a message
    (this.handlers.get(event) as Set<Handler<BridgeEvents[K]>> | undefined)?.forEach((fn) => fn(data)); // call every listener
  }
}

export const bridge = new Bridge(); // ONE shared bridge for the whole app

// Shared virtual controls written by the on-screen touch buttons and read by Phaser every frame.
export const virtualInput = { x: 0, y: 0, interact: false }; // x/y in −1…1, interact = button tapped
