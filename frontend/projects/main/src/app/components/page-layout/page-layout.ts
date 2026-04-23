import { NgClass, NgTemplateOutlet } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  ContentChild,
  ElementRef,
  HostListener,
  inject,
  input,
  model,
  OnDestroy,
  signal,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidFilter, faSolidXmark } from '@ng-icons/font-awesome/solid';
import { TranslatePipe } from '@ngx-translate/core';
import {
  APPLICATION_CONFIGURATION,
  SEARCH_ROUTE_PATH,
  SearchActiveFiltersButton,
  SearchBase,
  SearchInput,
  SearchWelcomeTextPipe,
  SpaceSelector,
} from 'gn-library';
import { Button } from 'primeng/button';
import { Drawer } from 'primeng/drawer';
import { SearchFilters } from '../search-filters/search-filters';
import { FilterPanelLayout } from '../search/search';

@Component({
  selector: 'app-page-layout',
  imports: [
    SearchInput,
    SearchActiveFiltersButton,
    SearchWelcomeTextPipe,
    Drawer,
    SearchFilters,
    NgIcon,
    Button,
    NgClass,
    NgTemplateOutlet,
    TranslatePipe,
    SpaceSelector,
  ],
  viewProviders: [provideIcons({ faSolidFilter, faSolidXmark })],
  template: `
    <ng-template #defaultHeader />
    <ng-template #defaultFooter />

    <div class="flex flex-row w-full">
      <div class="flex flex-col w-full">
        <div
          #headerRow
          class="top-0 z-10 w-full header-row bg-cover bg-bottom bg-no-repeat px-6 py-8"
          [class.bg-primary-400]="!backgroundImageUrl()"
          [class.bg-black]="backgroundImageUrl()"
          [style.background-image]="
            backgroundImageUrl() ? 'url(' + backgroundImageUrl() + ')' : null
          "
        >
          <div class="mx-auto max-w-7xl flex flex-col lg:gap-2">
            <ng-container *ngTemplateOutlet="header || defaultHeader" />
            @if (withSearch()) {
              <div class="flex flex-row items-center gap-2">
                <app-search-input
                  class="w-full grow"
                  [autocompleteEnabled]="true"
                  (onSearch)="setRouteToSearch()"
                  [placeholder]="search | searchWelcomeTextPipe: 'resourceType' : 3"
                />

                @if (filterPanelMode() == 'drawer' || filterPanelMode() == 'side') {
                  <app-search-active-filters-button [(visible)]="visible" />
                }

                <app-space-selector />
              </div>
            }
            <ng-container *ngTemplateOutlet="footer || defaultFooter" />
          </div>
        </div>
        <ng-content />
      </div>
      @if (withSearch()) {
        @switch (filterPanelMode()) {
          @case ('drawer') {
            <p-drawer
              [(visible)]="visible"
              [header]="'search.filter.title' | translate"
              [modal]="false"
              position="right"
              [pt]="{ header: 'header-row' }"
            >
              <app-search-filters />
            </p-drawer>
          }
          @case ('side') {
            <div
              class="w-full h-screen sticky top-0 self-start transition-all duration-300 ease-in-out min-w-0 max-w-100 border-primary-50 overflow-x-hidden"
              [ngClass]="
                visible
                  ? 'sm:w-1/3 sm:opacity-100 border-l-2 shadow overflow-y-auto'
                  : 'sm:w-0! sm:opacity-0 border-none shadow-none'
              "
            >
              <div class="app-drawer-header header-row">
                <div class="app-drawer-title text-primary-500">
                  <ng-icon name="faSolidFilter"></ng-icon>
                  {{ 'search.filter.title' | translate }}
                </div>
                <p-button (click)="visible = !visible" variant="text" rounded="true">
                  <ng-icon name="faSolidXmark" pButtonIcon></ng-icon>
                </p-button>
              </div>
              <app-search-filters />
            </div>
          }
        }
      }
    </div>
  `,
  styles: [
    `
      .app-drawer-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        padding: var(--p-drawer-header-padding, 1rem);
        border-bottom: 1px solid var(--p-content-border-color, var(--p-surface-200));
        background: var(--p-content-background, var(--p-surface-0));
      }

      .app-drawer-title {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: var(--p-drawer-title-font-size, 1.25rem);
        font-weight: var(--p-drawer-title-font-weight, 600);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageLayout extends SearchBase implements AfterViewInit, OnDestroy {
  @ViewChild('titleSection') titleSection!: ElementRef<HTMLElement>;
  @ViewChild('headerRow') headerRow!: ElementRef<HTMLElement>;
  @ContentChild('header') header!: TemplateRef<any>;
  @ContentChild('footer') footer!: TemplateRef<any>;

  withSearch = input(true);

  filterPanelMode = model<FilterPanelLayout>('side');

  visible = false;

  router = inject(Router);

  appConfiguration = inject(APPLICATION_CONFIGURATION);

  backgroundImageUrl = computed(() => this.appConfiguration().config?.backgroundImageUrl || '');

  scrollY = signal(0);
  titleSectionHeight = signal(0);
  headerRowHeight = signal(0);

  stickyTop = computed(() => {
    // 112px is min-h-28 (7rem)
    // We want to scroll up until only min-h-28 remains visible
    const height = this.headerRowHeight();
    return Math.min(0, 112 - height);
  });

  private resizeObserver: ResizeObserver | undefined;

  @HostListener('window:scroll')
  onScroll() {
    this.scrollY.set(window.scrollY);
  }

  ngAfterViewInit() {
    this.measureHeights();
    this.resizeObserver = new ResizeObserver(() => {
      this.measureHeights();
    });
    if (this.headerRow?.nativeElement) {
      this.resizeObserver.observe(this.headerRow.nativeElement);
    }
  }

  ngOnDestroy() {
    this.resizeObserver?.disconnect();
  }

  private measureHeights() {
    if (this.titleSection?.nativeElement) {
      this.titleSectionHeight.set(this.titleSection.nativeElement.offsetHeight);
    }
    if (this.headerRow?.nativeElement) {
      this.headerRowHeight.set(this.headerRow.nativeElement.offsetHeight);
    }
  }

  setRouteToSearch() {
    if (!this.router.url.startsWith(SEARCH_ROUTE_PATH)) {
      this.router.navigate([SEARCH_ROUTE_PATH]);
    }
  }
}
