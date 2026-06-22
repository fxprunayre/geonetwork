import { Component, SecurityContext, computed, inject, input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidArrowUpRightFromSquare } from '@ng-icons/font-awesome/solid';
import { TranslatePipe } from '@ngx-translate/core';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-dataviz-panel',
  standalone: true,
  imports: [Button, TranslatePipe, NgIcon],
  viewProviders: [provideIcons({ faSolidArrowUpRightFromSquare })],
  templateUrl: './dataviz-panel.html',
})
export class ExploreDatavizPanel {
  url = input<string | undefined>();

  private sanitizer = inject(DomSanitizer);

  datavizHref = computed(() => {
    const rawUrl = this.url();
    if (!rawUrl) {
      return undefined;
    }

    const sanitized = this.sanitizer.sanitize(SecurityContext.URL, rawUrl);
    return sanitized || undefined;
  });

  safeUrl = computed<SafeResourceUrl | null>(() => {
    const href = this.datavizHref();
    if (!href) {
      return null;
    }

    return this.sanitizer.bypassSecurityTrustResourceUrl(href);
  });

  openDatavizInNewWindow = () => {
    const href = this.datavizHref();
    if (!href) {
      return;
    }

    window.open(href, '_blank', 'noopener,noreferrer');
  };
}
