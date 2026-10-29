// src/game/PhaserGame.tsx — React component that shows the Phaser canvas.
// Only ONE Phaser.Game is ever created. It lives in a permanent <div id="phaser-root"> attached to <body>,
// which we simply show while exploring and hide (and put to sleep) otherwise. (Moving a Phaser canvas between React divs
// breaks its size detection, so a permanent home is the reliable approach.)
import { useEffect } from 'react'; // React hook
import Phaser from 'phaser'; // game engine
import { ExplorationScene, type SceneData } from './ExplorationScene'; // our reusable scene

let game: Phaser.Game | null = null; // module-level singleton (prevents duplicate Phaser instances)

function getRoot(): HTMLDivElement { // find or create the permanent host element
  let el = document.getElementById('phaser-root') as HTMLDivElement | null; // already there?
  if (!el) { el = document.createElement('div'); el.id = 'phaser-root'; document.body.appendChild(el); } // create once
  return el; // the host
}

export function PhaserGame({ data }: { data: SceneData }) { // props: the stage configuration
  useEffect(() => { // runs after the component appears on screen
    const root = getRoot(); // permanent host
    root.style.visibility = 'visible'; // show the canvas (visibility, not display:none — a 0×0 canvas crashes WebGL)
    game?.loop.wake(); // resume the game loop if it was sleeping
    if (!game) { // create the game only once
      game = new Phaser.Game({ // Phaser configuration
        type: Phaser.AUTO, // use WebGL if available, otherwise Canvas
        parent: root, // draw inside the permanent div
        backgroundColor: '#050a1a', // deep-space navy behind everything
        scale: { mode: Phaser.Scale.RESIZE, width: '100%', height: '100%' }, // fill the screen and follow window size
        scene: [ExplorationScene], // register our scene (not started yet)
        render: { antialias: true }, // smooth edges
        audio: { noAudio: true }, // all sound is handled centrally by src/audio/audio.ts
      });
      if (import.meta.env.DEV) (window as unknown as { __cosmotrekkGame?: Phaser.Game }).__cosmotrekkGame = game; // DEVELOPMENT ONLY: lets automated smoke tests inspect the scene (not in production builds)
    }
    const g = game; // local copy for the closure
    const start = () => { g.scale.refresh(); g.scene.start('explore', data); }; // re-measure the screen, then (re)start the scene with fresh data
    if (g.isBooted) start(); else g.events.once(Phaser.Core.Events.READY, start); // wait for boot on the very first run
    return () => { // when leaving the exploration screen
      if (g.scene.isActive('explore') || g.scene.isPaused('explore')) g.scene.stop('explore'); // stop the scene (the Game object is kept)
      root.style.visibility = 'hidden'; // hide the canvas but keep its size
      g.loop.sleep(); // stop the game loop while not exploring (saves battery)
    };
  }, [data]); // re-run whenever a new stage config arrives

  return <div className="phaser-host" aria-label="Exploration area. Use arrow keys or WASD to move and E to interact." role="application" />; // accessible placeholder (the canvas sits underneath)
}
