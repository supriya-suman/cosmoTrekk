// src/main.tsx — the entry point: mounts the React app into <div id="root"> in index.html.
import { StrictMode } from 'react'; // StrictMode warns about common mistakes during development
import { createRoot } from 'react-dom/client'; // React 19 renderer for the browser
import App from './App'; // our root component
import './styles.css'; // global styles

createRoot(document.getElementById('root')!).render( // find the root div and draw the app inside it
  <StrictMode> {/* extra checks in development only */}
    <App /> {/* the whole game */}
  </StrictMode>,
);
