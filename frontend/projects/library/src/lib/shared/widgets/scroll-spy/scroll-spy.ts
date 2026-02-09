import { NgTemplateOutlet } from '@angular/common';
import { AfterViewInit, Component, input, OnDestroy, signal } from '@angular/core';

interface SectionItem {
  id: string;
  title: string;
}

@Component({
  selector: 'app-scroll-spy',
  standalone: true,
  imports: [NgTemplateOutlet],
  templateUrl: './scroll-spy.html',
  styles: [
    `
      .scroll-spy-tab {
        flex-shrink: 0;
        cursor: pointer;
        user-select: none;
        position: relative;
        border-style: solid;
        white-space: nowrap;
        gap: var(--p-tabs-tab-gap);
        background: var(--p-tabs-tab-background);
        border-color: var(--p-tabs-tab-border-color);
        color: var(--p-tabs-tab-color);
        padding: var(--p-tabs-tab-padding);
        font-weight: var(--p-tabs-tab-font-weight);
        margin: var(--p-tabs-tab-margin);
        outline-color: transparent;
      }
      .scroll-spy-tab:hover {
        color: var(--p-tabs-tab-hover-color);
      }
      .scroll-spy-tab-top {
        border-width: 0 0 1px 0;
      }
      .scroll-spy-tab-aside {
        border-width: 0 0 0 1px;
        display: block;
      }
      .scroll-spy-tab-active {
        background: var(--p-tabs-tab-active-background);
        border-color: var(--p-tabs-tab-active-border-color);
        border-width: 0 0 0 var(--p-tabs-active-bar-height);
        color: var(--p-tabs-tab-active-color);
      }
    `,
  ],
})
export class ScrollSpy implements OnDestroy, AfterViewInit {
  navPosition = input<'aside' | 'top'>('aside');

  target = input<HTMLElement>();
  section = input('section');
  title = input('h1');

  sections: SectionItem[] = [];
  activeSectionId = signal<string | null>(null);
  private sectionElements: NodeListOf<HTMLElement> | undefined;
  private scrollContainer: HTMLElement | Window = window;
  private shadowDomContainer: HTMLElement | undefined;
  private ticking = false;

  ngAfterViewInit() {
    setTimeout(() => this.initializeScrollSpy());
  }

  ngOnDestroy(): void {
    this.scrollContainer.removeEventListener('scroll', this.onScroll);
  }

  private getScrollParent(node: HTMLElement | null): HTMLElement | Window {
    if (!node || node === document.body) {
      return window;
    }

    if (node.parentNode instanceof ShadowRoot) {
      this.shadowDomContainer = node;
    }

    const style = window.getComputedStyle(node);
    const overflowY = style.overflowY;
    const isScrollable = overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay';

    if (isScrollable && node.scrollHeight > node.clientHeight) {
      return node;
    }

    return this.getScrollParent(node.parentElement);
  }

  initializeScrollSpy(): void {
    this.scrollContainer = this.getScrollParent(this.target() || null);
    this.scrollContainer.addEventListener('scroll', this.onScroll);
    const target = this.target();
    if (!target) {
      this.sections = [];
      this.sectionElements = undefined;
      this.activeSectionId.set(null);
      return;
    }
    this.sectionElements = target.querySelectorAll(`${this.section()}`);

    this.sections = Array.from(this.sectionElements).flatMap((section) => {
      const h1 = section.querySelector(this.title());
      const id = h1?.getAttribute('id');

      if (!id) {
        console.warn(
          `Scroll spy is skipping a section because its heading is missing an ID.`,
          section,
        );
        return []; // Skip this section
      }

      const title = h1?.textContent?.trim() || section.getAttribute('data-spy-title') || id;

      return [{ id, title }];
    });

    if (this.sections.length > 0 && !this.activeSectionId()) {
      this.activeSectionId.set(this.sections[0].id);
    }
  }

  scrollTo(id: string): void {
    const isWindow = this.scrollContainer instanceof Window;

    if (isWindow && !this.shadowDomContainer) {
      const targetElement = document.getElementById(id);
      if (!targetElement) {
        return;
      }
      window.scrollTo({
        top: targetElement.offsetTop - 60,
        behavior: 'smooth',
      });
    } else {
      const container = this.shadowDomContainer || (this.scrollContainer as HTMLElement);
      const targetElement = container.querySelector(`#${id}`);

      if (!targetElement) {
        return;
      }
      const top =
        targetElement.getBoundingClientRect().top -
        container.getBoundingClientRect().top +
        container.scrollTop -
        60;
      this.scrollContainer.scrollTo({
        top,
        behavior: 'smooth',
      });
    }

    this.activeSectionId.set(id);
  }

  onScroll = (): void => {
    if (!this.ticking) {
      window.requestAnimationFrame(() => {
        this.checkActiveSection();
        this.ticking = false;
      });
      this.ticking = true;
    }
  };

  private checkActiveSection(): void {
    if (!this.sectionElements) return;

    let currentActive: string | null = null;
    const headerOffset = 80;

    this.sectionElements.forEach((section, idx) => {
      const rect = section.getBoundingClientRect();
      let containerTop = 0;
      if (this.scrollContainer instanceof HTMLElement) {
        containerTop = this.scrollContainer.getBoundingClientRect().top;
      }

      if (rect.top <= containerTop + headerOffset) {
        currentActive = this.sections[idx].id;
      }
    });

    if (currentActive !== this.activeSectionId()) {
      this.activeSectionId.set(currentActive);
    }
  }
}
