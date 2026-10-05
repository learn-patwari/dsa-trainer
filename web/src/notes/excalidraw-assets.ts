// Excalidraw loads its fonts from window.EXCALIDRAW_ASSET_PATH, and falls back to
// esm.sh when it isn't set. The API server serves the package's own copy at
// /excalidraw/, so the canvas works offline and nothing leaves the machine.
// This file is imported before Excalidraw so the path is in place first.
(window as unknown as { EXCALIDRAW_ASSET_PATH: string }).EXCALIDRAW_ASSET_PATH = '/excalidraw/';

export {};
