import { NgClass, NgTemplateOutlet } from '@angular/common';
import { Component, computed, effect, inject, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidCheck, faSolidXmark } from '@ng-icons/font-awesome/solid';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { GroupPrivilege, RecordsService, SharingResponse } from 'gn4-api-client';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { AuthStore } from '../../../authentication/auth.store';
import { RecordFieldBase } from '../../../record';

const OPERATION_COLUMNS_ORDER = ['view', 'dynamic', 'download', 'process', 'editing'];

interface SharingPrivilegeRow {
  group: number | null;
  label: string;
  title?: string;
  operations: Record<string, boolean>;
  reserved?: boolean;
  restricted?: boolean;
  recordPrivilege?: boolean;
  userGroup?: boolean;
  userProfiles?: string[];
  userProfile?: string[];
}

@Component({
  selector: 'app-record-sharing-by-group-panel',
  template: `
    @if (visible()) {
      <p-dialog
        styleClass="w-[90vw] max-w-6xl"
        [(visible)]="visible"
        [modal]="true"
        [header]="'record.action.sharing.byGroup.label' | translate"
        (onHide)="reset()"
      >
        <div class="flex flex-col gap-4 w-full">
          <p>{{ 'record.action.sharing.byGroup.help' | translate }}</p>
          @if (loadError()) {
            <p-message severity="error">{{ loadError() }}</p-message>
          } @else {
            <ng-template #sharingRow let-rowData>
              @let backgroundColor =
                rowData.reserved
                  ? 'var(--p-primary-200)'
                  : rowData.recordPrivilege
                    ? 'var(--p-primary-100)'
                    : '';

              @if (isLoading()) {
                <tr [style.backgroundColor]="backgroundColor">
                  <td
                    class="w-1!"
                    [ngClass]="getProfileClass(rowData)"
                    [title]="getProfileLabel(rowData)"
                  ></td>
                  <td class="w-1/2" colspan="2">
                    <p-skeleton width="10rem" height="1.5rem" />
                  </td>
                  @for (operation of operationColumns(); track operation) {
                    <td></td>
                  }
                </tr>
              } @else {
                @let isGroupDisabled = isGroupOperationsDisabled(rowData);
                <tr [style.backgroundColor]="backgroundColor">
                  <td
                    class="w-1!"
                    [ngClass]="getProfileClass(rowData)"
                    [title]="getProfileLabel(rowData)"
                  ></td>
                  <td
                    colspan="2"
                    class=" w-1/2 font-bold"
                    [class.cursor-pointer]="!isGroupDisabled"
                    [title]="
                      isGroupDisabled
                        ? ''
                        : ('record.action.sharing.byGroup.dblClickToToggle' | translate)
                    "
                    (dblclick)="isGroupDisabled ? null : setAllOperations(rowData)"
                  >
                    {{ rowData.label }}
                  </td>
                  @for (operation of operationColumns(); track operation) {
                    <td
                      [title]="'record.action.sharing.operations.' + operation + 'Help' | translate"
                    >
                      @if (rowData.operations[operation] !== undefined) {
                        <div class="flex items-center justify-center">
                          <p-checkbox
                            [(ngModel)]="rowData.operations[operation]"
                            [binary]="true"
                            [disabled]="isGroupDisabled || isSaving()"
                            (ngModelChange)="markAsDirty()"
                          ></p-checkbox>
                        </div>
                      }
                    </td>
                  }
                </tr>
              }
            </ng-template>

            <p-table
              #table
              [value]="isLoading() ? loadingSkeletonRows() : sharingRows()"
              [frozenValue]="isLoading() ? [] : reservedSharingRows()"
              [globalFilterFields]="['groupLabel']"
              [sortField]="'label'"
              [sortOrder]="1"
              [scrollable]="true"
              [paginator]="sharingRows().length > 20"
              [rows]="20"
              scrollHeight="500px"
            >
              <ng-template #header>
                <tr>
                  @let showFilter = sharingRows().length > showFilterThreshold;
                  <th class="w-1!"></th>
                  <th pSortableColumn="label" class="w-1/4" [attr.colspan]="showFilter ? 1 : 2">
                    {{ 'record.action.sharing.byGroup.groupLabel' | translate }}
                    <p-sortIcon field="label"></p-sortIcon>
                  </th>
                  @if (showFilter) {
                    <th>
                      <p-columnFilter
                        type="text"
                        field="label"
                        matchMode="contains"
                        [placeholder]="
                          'record.action.sharing.byGroup.filterPlaceholder' | translate
                        "
                        [ariaLabel]="'record.action.sharing.byGroup.filterAriaLabel' | translate"
                        filterOn="input"
                      ></p-columnFilter>
                    </th>
                  }

                  @for (operation of operationColumns(); track operation) {
                    <th [pSortableColumn]="'operations.' + operation" class="text-left">
                      <div class="flex items-center justify-center">
                        {{ 'op-' + operation | translate }}
                        <p-sortIcon [field]="'operations.' + operation" />
                      </div>
                    </th>
                  }
                </tr>
              </ng-template>

              <ng-template #frozenbody let-rowData>
                <ng-container
                  *ngTemplateOutlet="sharingRow; context: { $implicit: rowData }"
                ></ng-container>
              </ng-template>

              <ng-template #body let-rowData>
                <ng-container
                  *ngTemplateOutlet="sharingRow; context: { $implicit: rowData }"
                ></ng-container>
              </ng-template>
            </p-table>
          }
        </div>
        <div class="flex flex-col gap-4 mt-4">
          <ng-content />
        </div>

        <ng-template pTemplate="footer">
          <p-button (onClick)="close()" [disabled]="isSaving()">
            <ng-icon name="faSolidXmark" pButtonIcon></ng-icon>
            <span pButtonLabel>{{ 'record.action.sharing.cancel' | translate }}</span>
          </p-button>
          <p-button (onClick)="confirm()" [disabled]="isFormInvalid()" [loading]="isSaving()">
            <ng-icon name="faSolidCheck" pButtonIcon></ng-icon>
            <span pButtonLabel>{{ 'record.action.sharing.save' | translate }}</span>
          </p-button>
        </ng-template>
      </p-dialog>
    }
  `,
  standalone: true,
  imports: [
    ButtonModule,
    DialogModule,
    CheckboxModule,
    NgClass,
    NgTemplateOutlet,
    InputTextModule,
    MessageModule,
    SkeletonModule,
    TableModule,
    FormsModule,
    NgIcon,
    TranslatePipe,
  ],
  viewProviders: [
    provideIcons({
      faSolidCheck,
      faSolidXmark,
    }),
  ],
})
export class RecordSharingByGroupPanelComponent extends RecordFieldBase {
  visible = model.required<boolean>();
  confirmed = output<void>();

  private readonly recordsService = inject(RecordsService);
  private readonly translate = inject(TranslateService);
  private readonly authStore = inject(AuthStore);
  readonly sharingResponse = signal<SharingResponse | null>(null);
  readonly sharingRows = signal<SharingPrivilegeRow[]>([]);
  readonly reservedSharingRows = signal<SharingPrivilegeRow[]>([]);
  readonly operationColumns = signal<string[]>(OPERATION_COLUMNS_ORDER);
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly isDirty = signal(false);
  readonly loadingSkeletonRows = computed(() =>
    this.isLoading()
      ? (Array.from({ length: 3 }, (_, index) => ({
          group: index,
          label: '',
          reserved: index === 0,
          operations: {},
        })) as SharingPrivilegeRow[])
      : [],
  );
  readonly showFilterThreshold = 10;

  canPublishToReservedGroups() {
    const user = this.authStore.user();
    // TODO: We have settings for that now
    // const profilesAllowedToPublishToReservedGroups = ['Administrator', 'Reviewer'];
    if (user === null) {
      return false;
    }
    if (user.admin) {
      return true;
    }

    const recordGroup = this.record().groupOwner;
    const isReviewer =
      recordGroup && user.groupsWithReviewer && user.groupsWithReviewer.includes(recordGroup);
    if (isReviewer) {
      return true;
    }
    return false;
  }

  isGroupOperationsDisabled(row: SharingPrivilegeRow): boolean {
    if (row.reserved && !this.canPublishToReservedGroups()) {
      return true;
    }
    return false;
  }

  getProfileClass(row: SharingPrivilegeRow): string {
    const isAdministrator = this.authStore.user()?.admin;
    const profile = isAdministrator
      ? 'Administrator'
      : row.userProfiles?.[0] || row.userProfile?.[0];
    switch (profile) {
      case 'Administrator':
        return '!border-l-4 !border-l-profile-administrator';
      case 'UserAdmin':
        return '!border-l-4 !border-l-profile-useradmin';
      case 'Reviewer':
        return '!border-l-4 !border-l-profile-reviewer';
      case 'Editor':
        return '!border-l-4 !border-l-profile-editor';
      case 'RegisteredUser':
        return '!border-l-4 !border-l-profile-registereduser';
      default:
        return '!border-l-4 !border-l-transparent';
    }
  }

  getProfileLabel(row: SharingPrivilegeRow): string {
    const isAdministrator = this.authStore.user()?.admin;
    return isAdministrator ? 'Administrator' : row.userProfiles ? row.userProfiles.join(', ') : '';
  }

  constructor() {
    super();

    effect((onCleanup) => {
      const isVisible = this.visible();
      const uuid = this.record().uuid;
      if (!isVisible || !uuid) {
        return;
      }

      this.isLoading.set(true);
      this.loadError.set(null);

      const sub = this.recordsService.getRecordSharingSettings(uuid).subscribe({
        next: (response) => {
          this.sharingResponse.set(response);
          this.initializeMatrix(response.privileges ?? []);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.loadError.set('Unable to load sharing settings.');
        },
      });

      onCleanup(() => sub.unsubscribe());
    });
  }

  isFormInvalid() {
    return this.isLoading() || !!this.loadError() || !this.isDirty();
  }

  markAsDirty() {
    this.isDirty.set(true);
  }

  excludeUnsupportedOperations(privilege: GroupPrivilege): Record<string, boolean> | null {
    const operations = privilege.operations ?? {};

    const supportedOperations = OPERATION_COLUMNS_ORDER.filter((op) => op in operations);
    if (supportedOperations.length === 0) {
      return null;
    }

    // notify, editing are not allowed for reserved and recordPrivileges groups
    if (privilege.reserved || privilege.recordPrivilege) {
      supportedOperations.forEach((op) => {
        if (op === 'notify' || op === 'editing') {
          delete operations[op];
        }
      });
    }

    return supportedOperations.reduce(
      (acc, op) => {
        acc[op] = operations[op];
        return acc;
      },
      {} as Record<string, boolean>,
    );
  }

  initializeMatrix(privileges: GroupPrivilege[]) {
    this.isDirty.set(false);
    const rows: SharingPrivilegeRow[] = privileges.map((privilege) => {
      return {
        label: privilege.group ? this.translate.instant(`group-${privilege.group}`) : 'N/A',
        title: privilege.reserved
          ? this.translate.instant('record.action.sharing.byGroup.type.reservedHelp')
          : privilege.recordPrivilege
            ? this.translate.instant('record.action.sharing.byGroup.type.recordPrivilegeHelp')
            : this.translate.instant('record.action.sharing.byGroup.type.workspaceHelp'),
        operations: this.excludeUnsupportedOperations(privilege) ?? {},
        ...privilege,
      } as SharingPrivilegeRow;
    });

    const sortedRows = [...rows].sort((a, b) => a.label.localeCompare(b.label));
    this.reservedSharingRows.set(
      sortedRows
        .filter((row) => !!row.reserved || !!row.recordPrivilege)
        .sort((a, b) => {
          if (a.reserved && !b.reserved) return -1;
          if (!a.reserved && b.reserved) return 1;
          return 0;
        }),
    );
    this.sharingRows.set(sortedRows.filter((row) => !row.reserved && !row.recordPrivilege));
    this.operationColumns.set(
      OPERATION_COLUMNS_ORDER.filter((op) => rows.some((row) => op in row.operations)),
    );
  }

  isChecked(row: SharingPrivilegeRow, operation: string): boolean {
    return !!row.operations[operation];
  }

  setAllOperations(row: SharingPrivilegeRow) {
    const allChecked = this.operationColumns().every((op) => row.operations[op]);
    this.operationColumns().forEach((op) => {
      row.operations[op] = !allChecked;
    });
    this.isDirty.set(true);
  }

  confirm() {
    const uuid = this.record().uuid;

    if (!uuid) {
      return;
    }
    if (this.isFormInvalid()) {
      return;
    }

    this.isSaving.set(true);
    this.recordsService
      .share(uuid, {
        privileges: [...this.reservedSharingRows(), ...this.sharingRows()].map((row) => ({
          group: row.group ?? undefined,
          operations: row.operations,
        })),
      })
      .subscribe({
        next: () => {
          this.confirmed.emit();
          this.close();
          this.isSaving.set(false);
        },
        error: () => {
          this.loadError.set('Unable to save sharing settings.');
          this.isSaving.set(false);
        },
      });
  }

  close() {
    this.visible.set(false);
    this.reset();
  }

  reset() {
    this.loadError.set(null);
    this.isDirty.set(false);
  }
}
