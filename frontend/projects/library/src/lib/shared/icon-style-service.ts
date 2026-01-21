import { Inject, Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export interface IconDefinition {
  className: string;
  svgContent: string;
}

@Injectable({
  providedIn: 'root',
})
export class IconStyleService {
  private renderer: Renderer2;

  constructor(
    rendererFactory: RendererFactory2,
    @Inject(DOCUMENT) private document: Document,
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  ensureIconsStyle(styleId: string, icons: IconDefinition[], rootNode?: Node) {
    const target = rootNode instanceof ShadowRoot ? rootNode : this.document.head;

    if (target.querySelector(`#${styleId}`)) {
      return;
    }

    const style = this.renderer.createElement('style');
    style.id = styleId;

    let cssContent = '';
    icons.forEach((icon) => {
      cssContent += `
      .${icon.className} {
        mask: url('data:image/svg+xml;utf8,${icon.svgContent}') no-repeat center;
        -webkit-mask: url('data:image/svg+xml;utf8,${icon.svgContent}') no-repeat center;
        mask-size: contain;
        -webkit-mask-size: contain;
        background-color: currentColor;
        display: inline-block;
        width: 1em;
        height: 1em;
      }`;
    });

    style.textContent = cssContent;
    this.renderer.appendChild(target, style);
  }
}
