import { DOCUMENT } from '@angular/common';
import { Injectable, RendererFactory2, inject } from '@angular/core';
import { MenuItem } from 'primeng/api';

export interface IconDefinition {
  className: string;
  svgContent: string;
}

@Injectable({
  providedIn: 'root',
})
export class IconStyleService {
  private renderer = inject(RendererFactory2).createRenderer(null, null);
  private document = inject(DOCUMENT);

  /**
   * Utility to register icons as CSS classes when primeng component
   * does not allow using NgIcon. eg. Menu
   */
  createIconsStyle(
    styleId: string,
    items: MenuItem[] | undefined,
    iconMap: Record<string, string | undefined>,
    rootNode?: Node,
  ) {
    if (!items) return;

    const usedIcons = new Set<string>();
    const collectIcons = (items: MenuItem[]) => {
      items.forEach((item) => {
        if (item.icon) {
          usedIcons.add(item.icon);
        }
        if (item.items) {
          collectIcons(item.items);
        }
      });
    };

    collectIcons(items);

    this.ensureIconsStyle(
      styleId,
      Array.from(usedIcons)
        .map((icon) => ({
          className: icon,
          svgContent: iconMap[icon as keyof typeof iconMap],
        }))
        .filter((def): def is { className: string; svgContent: string } => !!def.svgContent),
      rootNode,
    );
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
