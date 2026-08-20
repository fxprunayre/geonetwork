import { NgClass, NgStyle, NgTemplateOutlet } from '@angular/common';
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
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidFilter, faSolidXmark } from '@ng-icons/font-awesome/solid';
import { TranslatePipe } from '@ngx-translate/core';
import {
  APPLICATION_CONFIGURATION,
  SEARCH_ROUTE_PATH,
  SearchBase,
  SearchWelcomeTextPipe,
  ThemingService,
} from 'gn-library';
import { Button } from 'primeng/button';
import { Drawer } from 'primeng/drawer';
import { filter, map } from 'rxjs';
import { FilterPanelLayout } from '../../shared/models/search-layout.model';
import { SearchFilters } from '../search-filters/search-filters';
import { SearchPanelControls } from '../search-panel-controls/search-panel-controls';

@Component({
  selector: 'app-page-layout',
  imports: [
    SearchPanelControls,
    SearchWelcomeTextPipe,
    Drawer,
    SearchFilters,
    NgIcon,
    Button,
    NgClass,
    NgStyle,
    NgTemplateOutlet,
    TranslatePipe,
  ],
  viewProviders: [provideIcons({ faSolidFilter, faSolidXmark })],
  template: `
    <ng-template #defaultHeader />
    <ng-template #defaultFooter />

    <div class="flex flex-row w-full">
      <div class="flex flex-col w-full">
        <div
          #headerRow
          class="w-full bg-cover bg-bottom bg-no-repeat px-6 py-8"
          [class.bg-primary-400]="!bannerBackground()"
          [ngStyle]="bannerBackgroundStyle()"
          style="color: var(--app-background-text-color, #ffffff)"
        >
          <div class="mx-auto max-w-7xl flex flex-col lg:gap-2">
            <ng-container *ngTemplateOutlet="header || defaultHeader" />
            @if (withSearch()) {
              <div class="flex flex-row items-center w-full">
                <app-search-panel-controls
                  class="grow"
                  [showFilterButton]="isSearchActive()"
                  [filterPanelMode]="effectiveFilterPanelMode()"
                  [placeholder]="search() | searchWelcomeTextPipe: 'resourceType' : 3"
                  [(visible)]="visible"
                  (searchTriggered)="setRouteToSearch()"
                />

                <!-- Spacer to match the sidebar width and keep the search box aligned with the results -->
                @if (isSearchActive()) {
                  @if (effectiveFilterPanelMode() === 'side') {
                    <div
                      class="transition-all duration-300 ease-in-out min-w-0 max-w-100 border-l-2 border-transparent"
                      [ngClass]="visible ? 'sm:w-1/3' : 'sm:w-0!'"
                    ></div>
                  }
                  @if (effectiveFilterPanelMode() === 'side-fixed') {
                    <div class="sm:w-1/3 min-w-0 border-l-2 border-transparent"></div>
                  }
                }
              </div>
            }
            <ng-container *ngTemplateOutlet="footer || defaultFooter" />
          </div>
        </div>

        <div class="flex flex-row">
          <ng-content />
          @if (withSearch() && isSearchActive()) {
            @switch (effectiveFilterPanelMode()) {
              @case ('drawer') {
                <p-drawer
                  [(visible)]="visible"
                  [header]="'search.filter.title' | translate"
                  [modal]="false"
                  position="right"
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
                  <div class="app-drawer-header">
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
              @case ('side-fixed') {
                <div
                  class="w-full h-screen sticky top-0 self-start min-w-0 sm:w-1/3 sm:opacity-100 border-l-2 border-primary-50 shadow overflow-y-auto overflow-x-hidden"
                >
                  <div class="app-drawer-header">
                    <div class="app-drawer-title text-primary-500">
                      <ng-icon name="faSolidFilter"></ng-icon>
                      {{ 'search.filter.title' | translate }}
                    </div>
                  </div>
                  <app-search-filters />
                </div>
              }
            }
          }
        </div>
      </div>
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
  @ContentChild('header') header!: TemplateRef<unknown>;
  @ContentChild('footer') footer!: TemplateRef<unknown>;

  withSearch = input(true);

  filterPosition = model<FilterPanelLayout>('drawer');

  effectiveFilterPanelMode = computed<FilterPanelLayout>(() => {
    if (
      (this.filterPosition() === 'side' || this.filterPosition() === 'side-fixed') &&
      this.isSmallViewport()
    ) {
      return 'drawer';
    }
    return this.filterPosition();
  });

  visible = false;

  router = inject(Router);

  isSearchActive = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map((e: NavigationEnd) => e.urlAfterRedirects.startsWith(SEARCH_ROUTE_PATH)),
    ),
    { initialValue: this.router.url.startsWith(SEARCH_ROUTE_PATH) },
  );

  appConfiguration = inject(APPLICATION_CONFIGURATION);
  themingService = inject(ThemingService);

  bannerBackground = computed(() => this.appConfiguration().config?.apps?.banner?.background || '');

  bannerBackgroundStyle = computed(() =>
    this.themingService.getBannerBackgroundStyle(this.bannerBackground()),
  );

  scrollY = signal(0);
  viewportWidth = signal(typeof window !== 'undefined' ? window.innerWidth : 1024);
  titleSectionHeight = signal(0);
  headerRowHeight = signal(0);

  isSmallViewport = computed(() => this.viewportWidth() < 640);

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

  @HostListener('window:resize')
  onResize() {
    this.viewportWidth.set(window.innerWidth);
  }

  ngAfterViewInit() {
    this.viewportWidth.set(window.innerWidth);
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
