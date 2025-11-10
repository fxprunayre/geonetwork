import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  inject,
  input,
  ViewChild,
} from '@angular/core';
import { Button } from 'primeng/button';
import { NgTemplateOutlet } from '@angular/common';

interface SectionItem {
  id: string;
  title: string;
}

@Component({
  selector: 'app-scroll-spy',
  imports: [Button, NgTemplateOutlet],
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
        color: var(--p-tabs-tab-active-color);
      }
    `,
  ],
})
export class ScrollSpy implements AfterViewInit {
  navPosition = input<'aside' | 'top'>('aside');

  private elementRef = inject(ElementRef);

  sections: SectionItem[] = [];

  activeSectionId: string | null = null;

  private sectionElements: NodeListOf<HTMLElement> | undefined;

  ngAfterViewInit() {
    setTimeout(() => this.initializeScrollSpy());
  }

  initializeScrollSpy(): void {
    const hostElement: HTMLElement = this.elementRef.nativeElement;
    this.sectionElements = hostElement.querySelectorAll('section[id]');

    this.sections = Array.from(this.sectionElements).map((section) => {
      const h1 = section.querySelector('h1');
      const title = h1?.textContent?.trim() || section.getAttribute('data-spy-title') || section.id;
      return {
        id: section.id,
        title: title,
      };
    });

    this.activeSectionId = this.sections.length > 0 ? this.sections[0].id : null;
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

  @HostListener('window:scroll')
  onScroll(): void {
    if (!this.sectionElements) return;

    let currentActive: string | null = null;
    const scrollPosition = window.scrollY || document.documentElement.scrollTop;

    const headerOffset = 60;

    this.sectionElements.forEach((section) => {
      if (section.offsetTop <= scrollPosition + headerOffset) {
        currentActive = section.id;
      }
    });

    this.activeSectionId = currentActive;
  }
}
