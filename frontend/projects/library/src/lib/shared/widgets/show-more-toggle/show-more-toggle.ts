import { NgStyle } from '@angular/common';
import { AfterViewInit, Component, computed, ElementRef, signal, ViewChild } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidChevronDown, faSolidChevronUp } from '@ng-icons/font-awesome/solid';
import { TranslatePipe } from '@ngx-translate/core';
import { Button, ButtonIcon, ButtonLabel } from 'primeng/button';

@Component({
  selector: 'app-show-more-toggle',
  imports: [NgStyle, ButtonLabel, ButtonIcon, NgIcon, Button, TranslatePipe],
  viewProviders: [provideIcons({ faSolidChevronUp, faSolidChevronDown })],
  templateUrl: './show-more-toggle.html',
  styles: [
    `
      .content-container {
        transition: max-height 0.5s ease-in-out;
        overflow: hidden;
      }
    `,
  ],
})
export class ShowMoreToggle implements AfterViewInit {
  private readonly INITIAL_HEIGHT_REM = 16;
  private readonly INITIAL_HEIGHT_PX = this.INITIAL_HEIGHT_REM * 16; // 256px
  private readonly HEIGHT_TOLERANCE_PX = 20;

  isExpanded = signal(false);

  private fullHeightPx = signal(0);

  @ViewChild('contentContainer') contentRef!: ElementRef<HTMLDivElement>;

  needsToggle = computed(() => {
    return this.fullHeightPx() > this.INITIAL_HEIGHT_PX + this.HEIGHT_TOLERANCE_PX;
  });

  calculatedMaxHeight = computed(() => {
    if (this.isExpanded()) {
      return this.fullHeightPx() + 'px';
    }
    return this.INITIAL_HEIGHT_REM + 'rem';
  });

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.contentRef && this.contentRef.nativeElement) {
        this.fullHeightPx.set(this.contentRef.nativeElement.scrollHeight);
      }
    }, 0);
  }

  toggleContent() {
    if (this.isExpanded()) {
      this.isExpanded.set(false);
      setTimeout(() => {
        this.contentRef.nativeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 250);
    } else {
      this.isExpanded.set(true);
    }
  }
}
