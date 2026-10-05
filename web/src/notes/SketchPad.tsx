import './excalidraw-assets.ts'; // must run before Excalidraw loads a font
import { Excalidraw, hashElementsVersion, serializeAsJSON } from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';
import type { AppState, BinaryFiles, ExcalidrawInitialDataState } from '@excalidraw/excalidraw/types';
import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types';
import { useEffect, useRef, useState } from 'react';
import { api } from '../api.ts';

// Loaded lazily: Excalidraw is by far the heaviest thing in the app, and only this window needs it.

export type SaveState = 'idle' | 'saving' | 'saved' | 'error';
type Scene = { elements: readonly ExcalidrawElement[]; appState: AppState; files: BinaryFiles };

/** A save still on its way, per problem: reopening the canvas waits for it instead of loading the version before. */
const inflight = new Map<string, Promise<void>>();

/**
 * Excalidraw calls onChange for pointer moves and scrolling too. Element versions only
 * move when a drawing really changes, so this is the cheap test; the scene is only
 * serialised once it moves.
 */
function signature(elements: readonly ExcalidrawElement[], appState: Pick<AppState, 'viewBackgroundColor'>, files: BinaryFiles): string {
  return `${hashElementsVersion(elements)}|${appState.viewBackgroundColor}|${Object.keys(files).length}`;
}

function usePrefersDark(): boolean {
  const [dark, setDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const on = (e: MediaQueryListEvent) => setDark(e.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return dark;
}

/**
 * A free-form canvas for whatever a dry run can't express — recursion trees,
 * graph sketches, the shape of an idea. Saved per problem in its own file.
 */
export default function SketchPad({ slug, onStatus }: { slug: string; onStatus?: (s: SaveState) => void }) {
  const dark = usePrefersDark();
  const [initial, setInitial] = useState<ExcalidrawInitialDataState | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const latest = useRef<Scene | null>(null);
  const shown = useRef<string | null>(null);
  const lastSaved = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fontLoading = useRef(false);
  const report = useRef(onStatus);
  useEffect(() => {
    report.current = onStatus;
  });

  useEffect(() => {
    let alive = true;
    (inflight.get(slug) ?? Promise.resolve())
      .then(() => api.drawing(slug))
      .then(({ scene }) => {
        if (!alive) return;
        if (!scene) return setInitial(null);
        const parsed = JSON.parse(scene) as ExcalidrawInitialDataState;
        const elements = (parsed.elements ?? []) as readonly ExcalidrawElement[];
        lastSaved.current = scene;
        shown.current = signature(elements, { viewBackgroundColor: parsed.appState?.viewBackgroundColor ?? '#ffffff' }, parsed.files ?? {});
        setInitial({ elements, appState: { ...parsed.appState, collaborators: new Map() }, files: parsed.files ?? {} });
      })
      .catch((e: Error) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, [slug]);

  // One function for the timer and for closing the window, which must not lose the last stroke.
  const flush = useRef(() => {});
  flush.current = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    const s = latest.current;
    latest.current = null;
    if (!s) return;
    const scene = serializeAsJSON(s.elements, s.appState, s.files, 'local');
    if (scene === lastSaved.current) return report.current?.('saved');
    report.current?.('saving');
    const saving = api
      .saveDrawing(slug, scene)
      .then(() => {
        lastSaved.current = scene;
        report.current?.('saved');
      })
      .catch(() => report.current?.('error'))
      .finally(() => {
        if (inflight.get(slug) === saving) inflight.delete(slug);
      });
    inflight.set(slug, saving);
  };
  useEffect(() => () => flush.current(), []);

  if (error) return <div className="callout bad small" style={{ margin: '1rem' }}>Couldn't load the drawing: {error}</div>;
  if (initial === undefined) return <div className="small muted" style={{ padding: '1rem' }}>Loading the canvas…</div>;

  return (
    <div className="sketchpad">
      <Excalidraw
        initialData={initial}
        theme={dark ? 'dark' : 'light'}
        UIOptions={{ canvasActions: { loadScene: false, saveToActiveFile: false } }}
        onChange={(elements, appState, files) => {
          // A label is measured as it's typed; typed (or pasted) before the hand-drawn font arrives,
          // it's saved too narrow and drawn clipped from then on. Excalidraw registers its fonts as it
          // mounts, so its first change is the earliest point to fetch the default one.
          if (!fontLoading.current) {
            fontLoading.current = true;
            void document.fonts.load('20px Excalifont');
          }
          // Opening a blank canvas (or erasing it before the first save) shouldn't leave an empty file behind.
          if (lastSaved.current === null && elements.every((e) => e.isDeleted)) {
            if (latest.current) report.current?.('idle');
            if (timer.current) clearTimeout(timer.current);
            timer.current = null;
            latest.current = null;
            return;
          }
          const sig = signature(elements, appState, files);
          if (sig === shown.current) return;
          shown.current = sig;
          latest.current = { elements, appState, files };
          report.current?.('saving');
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => flush.current(), 900);
        }}
      />
    </div>
  );
}
