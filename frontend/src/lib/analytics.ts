type DataLayerEvent = { event: 'create_room' } | { event: 'start_game' } | { event: 'complete_game' };

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export function pushEvent(payload: DataLayerEvent) {
  if (typeof window === 'undefined') return;
  // 로컬에서는 GTM을 안 올리므로 dataLayer에도 쌓지 않는다
  if (process.env.NODE_ENV !== 'production') return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
}
