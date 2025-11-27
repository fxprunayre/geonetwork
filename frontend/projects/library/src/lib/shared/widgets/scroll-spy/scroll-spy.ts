import { AfterViewInit, Component, input, OnDestroy, OnInit } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

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
        transition:
          background var(--p-tabs-transition-duration),
          border-color var(--p-tabs-transition-duration),
          color var(--p-tabs-transition-duration),
          outline-color var(--p-tabs-transition-duration),
          box-shadow var(--p-tabs-transition-duration);
        margin: var(--p-tabs-tab-margin);
        outline-color: transparent;
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
export class ScrollSpy implements OnInit, OnDestroy, AfterViewInit {
  navPosition = input<'aside' | 'top'>('aside');

  target = input<HTMLElement>();
  section = input('section');
  title = input('h1');

  sections: SectionItem[] = [];
  activeSectionId: string | null = null;
  private sectionElements: NodeListOf<HTMLElement> | undefined;

  ngAfterViewInit() {
    setTimeout(() => this.initializeScrollSpy());
  }

  ngOnInit(): void {
    window.addEventListener('scroll', this.onScroll);
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.onScroll);
  }

  initializeScrollSpy(): void {
    const target = this.target();
    if (!target) {
      this.sections = [];
      this.sectionElements = undefined;
      this.activeSectionId = null;
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

    if (this.sections.length > 0 && !this.activeSectionId) {
      this.activeSectionId = this.sections[0].id;
    }
  }

  scrollTo(id: string): void {
    const targetElement = document.getElementById(id);

    if (targetElement) {
      window.scrollTo({
        top: targetElement.offsetTop,
        behavior: 'smooth',
      });

      this.activeSectionId = id;
    }
  }

  onScroll = (): void => {
    if (!this.sectionElements) return;

    let currentActive: string | null = null;
    const scrollPosition = window.scrollY || document.documentElement.scrollTop;

    const headerOffset = 60;

    this.sectionElements.forEach((section, idx) => {
      if (section.offsetTop <= scrollPosition + headerOffset) {
        currentActive = this.sections[idx].id;
      }
    });

    this.activeSectionId = currentActive;
  };
}
