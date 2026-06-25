import { computed, inject, Injectable } from '@angular/core';
import { RecordsService } from 'gn4-api-client';
import { MenuItem } from 'primeng/api';
import { Observable, of } from 'rxjs';
import { APPLICATION_CONFIGURATION } from '../../config/config.loader';
import { SharingMode } from '../../config/model/gnConfig';

@Injectable({ providedIn: 'root' })
export class RecordSharingService {
  private readonly recordsService = inject(RecordsService);
  readonly appConfiguration = inject(APPLICATION_CONFIGURATION);
  readonly sharingMode = computed<SharingMode>(
    () => this.appConfiguration().config?.apps?.sharing?.sharingMode ?? 'none',
  );

  createSharingMenuItem(options: {
    uuid: string | undefined;
    isPublishedToAll: boolean;
    translate: (key: string) => string;
    onChanged?: () => void;
    onByGroupRequested?: () => void;
  }): MenuItem | null {
    if (!options.uuid || !this.canManageSharing()) {
      return null;
    }

    const actionIcon = options.isPublishedToAll ? 'icon-lock' : 'icon-lock-open';

    if (this.canUseSimplePublishing()) {
      const uuid = options.uuid;
      const actionLabel = options.isPublishedToAll
        ? options.translate('record.action.sharing.unpublish')
        : options.translate('record.action.sharing.publish');
      const actionHelp = options.isPublishedToAll
        ? options.translate('record.action.sharing.unpublishHelp')
        : options.translate('record.action.sharing.publishHelp');
      const actionCommand = options.isPublishedToAll
        ? () =>
            this.unpublish(uuid).subscribe({
              next: () => options.onChanged?.(),
            })
        : () =>
            this.publish(uuid).subscribe({
              next: () => options.onChanged?.(),
            });

      return {
        label: actionLabel,
        title: actionHelp,
        icon: actionIcon,
        command: actionCommand,
      };
    }

    if (this.canUseByGroupPublishing()) {
      const actionLabel = options.translate('record.action.sharing.byGroup.label');
      const actionHelp = options.translate('record.action.sharing.byGroup.help');
      const actionCommand = () => options.onByGroupRequested?.();

      return {
        label: actionLabel,
        title: actionHelp,
        icon: actionIcon,
        command: actionCommand,
      };
    }

    return null;
  }

  canManageSharing(): boolean {
    return this.sharingMode() !== 'none';
  }

  canUseSimplePublishing(): boolean {
    return this.sharingMode() === 'simple';
  }

  canUseByGroupPublishing(): boolean {
    return this.sharingMode() === 'byGroup';
  }

  publish(uuid: string): Observable<unknown> {
    if (!this.canUseSimplePublishing()) {
      return of(undefined);
    }
    return this.recordsService.publish(uuid);
  }

  unpublish(uuid: string): Observable<unknown> {
    if (!this.canUseSimplePublishing()) {
      return of(undefined);
    }
    return this.recordsService.unpublish(uuid);
  }
}
