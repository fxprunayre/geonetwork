export const SEXTANT_VIEWER_SCRIPT_URL =
  'https://cdn.jsdelivr.net/gh/camptocamp/sextant-viewer@dist-main/sxt-viewer.js';

export interface MapViewerLike {
  setContext: (context: unknown) => void;
  addLayer: (
    layer: {
      type: string;
      id: string;
      url: string;
      name: string;
      label: string;
      visibility: boolean;
      attributions: string;
    },
    focus: boolean,
  ) => void;
}

export async function ensureSxtViewer(
  scriptUrl: string,
  hostElement: HTMLElement,
): Promise<MapViewerLike | null> {
  if (!document.querySelector(`script[src="${scriptUrl}"]`)) {
    const script = document.createElement('script');
    script.type = 'module';
    script.src = scriptUrl;
    script.crossOrigin = 'anonymous';
    document.body.appendChild(script);
    await new Promise<void>((resolve) => {
      script.onload = () => resolve();
    });
  }

  await customElements.whenDefined('sxt-viewer');

  return hostElement.querySelector('sxt-viewer') as MapViewerLike | null;
}
