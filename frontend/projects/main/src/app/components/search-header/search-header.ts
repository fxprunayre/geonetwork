import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostListener,
  inject,
  model,
  signal,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  SearchInput,
  SearchActiveFiltersButton,
  SearchBase,
  APPLICATION_CONFIGURATION,
  SearchWelcomeTextPipe,
  SEARCH_ROUTE_PATH,
} from 'gn-library';
import { FilterPanelLayout } from '../search/search';
import { Drawer } from 'primeng/drawer';
import { SearchFilters } from '../search-filters/search-filters';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { Button } from 'primeng/button';
import { NgClass } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { faSolidFilter, faSolidXmark } from '@ng-icons/font-awesome/solid';
import { Router, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs';

@Component({
  selector: 'app-search-header',
  imports: [
    SearchInput,
    SearchActiveFiltersButton,
    SearchWelcomeTextPipe,
    Drawer,
    SearchFilters,
    NgIcon,
    Button,
    NgClass,
    TranslatePipe,
  ],
  viewProviders: [provideIcons({ faSolidFilter, faSolidXmark })],
  template: `
    <div class="flex flex-row w-full">
      <div class="flex flex-col w-full">
        <!-- [style.top.px]="stickyTop()" -->
        <div
          #headerRow
          class="top-0 z-10 w-full header-row bg-cover bg-bottom bg-no-repeat px-6 py-8"
          [class.sticky]="!isHome()"
          [class.bg-primary-400]="!backgroundImageUrl()"
          [class.bg-black]="backgroundImageUrl()"
          [style.background-image]="
            backgroundImageUrl() ? 'url(' + backgroundImageUrl() + ')' : null
          "
        >
          <div class="mx-auto max-w-7xl flex flex-col lg:gap-2">
            <section class="transition-all duration-300" [style]="headerStyle()">
              <h1
                class="text-white text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight max-w-2xl mx-auto md:mx-0"
              >
                {{ 'home.title' | translate }}
              </h1>

              <p
                class="text-white text-lg sm:text-xl md:text-2xl mt-4 mb-8 max-w-xl mx-auto md:mx-0"
              >
                {{ 'home.subtitle' | translate }}
              </p>
            </section>
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
            </div>
          </div>
        </div>
        <ng-content />
      </div>

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
            class="w-full h-screen sticky top-0 self-start transition-all duration-300 ease-in-out min-w-0 max-w-[400px] border-primary-50 overflow-x-hidden"
            [ngClass]="
              visible
                ? 'sm:w-1/3 sm:opacity-100 border-l-2 shadow overflow-y-auto'
                : 'sm:w-0! sm:opacity-0 border-none shadow-none'
            "
          >
            <div class="p-drawer-header header-row">
              <div class="p-drawer-title text-primary-500">
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
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchHeader extends SearchBase implements AfterViewInit, OnDestroy {
  @ViewChild('titleSection') titleSection!: ElementRef<HTMLElement>;
  @ViewChild('headerRow') headerRow!: ElementRef<HTMLElement>;

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

  headerStyle = computed(() => {
    if (!this.isHome()) {
      return {
        display: 'none',
      };
    }

    return {};

    // TODO: Re-enable when we want the header to fade out on scroll
    const scroll = this.scrollY();
    // Fade out over the distance of the header row height minus the visible sticky height (112px)
    // This ensures the title fades out completely just as the header becomes fully sticky.
    const fadeDistance = Math.max(100, this.headerRowHeight() - 112);
    const opacity = Math.max(0, 1 - scroll / fadeDistance);

    return {
      opacity: opacity.toFixed(2),
      visibility: opacity === 0 ? 'hidden' : 'visible',
    };
  });

  isHome = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map((e: any) => e.urlAfterRedirects === '/' || e.urlAfterRedirects === ''),
    ),
    { initialValue: this.router.url === '/' || this.router.url === '' },
  );

  isCatchWordDisplayed = computed(() => {
    return this.isHome();
  });

  setRouteToSearch() {
    if (!this.router.url.startsWith(SEARCH_ROUTE_PATH)) {
      this.router.navigate([SEARCH_ROUTE_PATH]);
    }
  }
}
