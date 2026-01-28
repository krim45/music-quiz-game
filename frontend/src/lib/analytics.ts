type DataLayerEvent =
  | { event: 'create_room' }
  | { event: 'start_game' }
  | { event: 'complete_game'; nickname?: string };

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export function pushEvent(payload: DataLayerEvent) {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
}
