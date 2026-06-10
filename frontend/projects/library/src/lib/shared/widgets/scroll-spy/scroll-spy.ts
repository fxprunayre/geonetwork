import { NgTemplateOutlet } from '@angular/common';
import { AfterViewInit, Component, input, OnDestroy, signal } from '@angular/core';

interface SectionItem {
  id: string;
  title: string;
  element: HTMLElement;
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
  private scrollContainer: HTMLElement | Window = window;
  private shadowDomContainer: HTMLElement | undefined;
  private ticking = false;
  private initTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private instanceId = Math.random().toString(36).slice(2);

  ngAfterViewInit() {
    this.initTimeoutId = setTimeout(() => this.initializeScrollSpy(), 100);
  }

  ngOnDestroy(): void {
    if (this.initTimeoutId) {
      clearTimeout(this.initTimeoutId);
      this.initTimeoutId = null;
    }
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
    this.scrollContainer.removeEventListener('scroll', this.onScroll);
    this.scrollContainer = this.getScrollParent(this.target() || null);
    this.scrollContainer.addEventListener('scroll', this.onScroll);

    const target = this.target();
    if (!target) {
      this.sections = [];
      this.activeSectionId.set(null);
      return;
    }

    this.sections = Array.from(target.querySelectorAll<HTMLElement>(`${this.section()}`)).flatMap(
      (section, index) => {
        const h1 = section.querySelector(this.title());
        let id = h1?.getAttribute('id');

        if (!id && h1 instanceof HTMLElement) {
          id = `scroll-spy-${this.instanceId}-${index}`;
          h1.setAttribute('id', id);
        }

        if (!id) {
          console.warn(
            `Scroll spy is skipping a section because its heading is missing an ID.`,
            section,
          );
          return []; // Skip this section
        }

        const title = h1?.textContent?.trim() || section.getAttribute('data-spy-title') || id;

        return [{ id, title, element: section }];
      },
    );

    if (this.sections.length > 0 && !this.activeSectionId()) {
      this.activeSectionId.set(this.sections[0].id);
    }
  }

  scrollTo(id: string): void {
    const section = this.sections.find((entry) => entry.id === id);
    if (!section) {
      return;
    }

    const targetElement = section.element;
    const isWindow = this.scrollContainer instanceof Window;

    if (isWindow && !this.shadowDomContainer) {
      window.scrollTo({
        top: window.scrollY + targetElement.getBoundingClientRect().top - 60,
        behavior: 'smooth',
      });
    } else {
      const container = this.shadowDomContainer || (this.scrollContainer as HTMLElement);
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

  isTopNav(): boolean {
    return this.navPosition() === 'top';
  }

  isAsideNav(): boolean {
    return this.navPosition() === 'aside';
  }

  isSectionActive(id: string): boolean {
    return this.activeSectionId() === id;
  }

  sectionClass(id: string): string {
    const classes = ['scroll-spy-tab'];
    if (this.isTopNav()) {
      classes.push('scroll-spy-tab-top');
    }
    if (this.isAsideNav()) {
      classes.push('scroll-spy-tab-aside');
    }
    if (this.isSectionActive(id)) {
      classes.push('scroll-spy-tab-active');
    }
    return classes.join(' ');
  }

  private checkActiveSection(): void {
    if (this.sections.length === 0) return;

    let currentActive: string | null = null;
    const headerOffset = 80;

    this.sections.forEach((section) => {
      const rect = section.element.getBoundingClientRect();
      let containerTop = 0;
      if (this.scrollContainer instanceof HTMLElement) {
        containerTop = this.scrollContainer.getBoundingClientRect().top;
      }

      if (rect.top <= containerTop + headerOffset) {
        currentActive = section.id;
      }
    });

    if (currentActive !== this.activeSectionId()) {
      this.activeSectionId.set(currentActive);
    }
  }
}
