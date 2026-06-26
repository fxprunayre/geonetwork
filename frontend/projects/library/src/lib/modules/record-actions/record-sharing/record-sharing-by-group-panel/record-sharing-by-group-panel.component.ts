import { NgTemplateOutlet } from '@angular/common';
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
import { RecordFieldBase } from '../../../record/record-field-base/record-field-base';

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
}

@Component({
  selector: 'app-record-sharing-by-group-panel',
  template: `
    <p-dialog
      class="m-10"
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
                <td class="p-2 w-1/2"><p-skeleton width="10rem" height="1.5rem" /></td>
                @for (operation of operationColumns(); track operation) {
                  <td class="p-2"></td>
                }
              </tr>
            } @else {
              <tr [style.backgroundColor]="backgroundColor">
                <td
                  class="p-2 w-1/2 font-bold cursor-pointer"
                  [title]="'record.action.sharing.byGroup.dblClickToToggle' | translate"
                  (dblclick)="setAllOperations(rowData)"
                >
                  {{ rowData.label }}
                </td>
                @for (operation of operationColumns(); track operation) {
                  <td
                    class="p-2"
                    [title]="'record.action.sharing.operations.' + operation + 'Help' | translate"
                    [class.bg-[var(--p-primary-100)]]="
                      operation === 'view' || operation === 'editing'
                    "
                  >
                    @if (rowData.operations[operation] !== undefined) {
                      <div class="flex items-center justify-center">
                        <p-checkbox
                          [(ngModel)]="rowData.operations[operation]"
                          [binary]="true"
                          [disabled]="isSaving()"
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
                <th pSortableColumn="label" class="text-left p-2">
                  {{ 'record.action.sharing.byGroup.groupLabel' | translate }}
                  <p-sortIcon field="label"></p-sortIcon>
                </th>
                @for (operation of operationColumns(); track operation) {
                  <th [pSortableColumn]="'operations.' + operation" class="text-left p-2">
                    <div class="flex items-center justify-center">
                      {{ 'op-' + operation | translate }}
                      <p-sortIcon [field]="'operations.' + operation" />
                    </div>
                  </th>
                }
              </tr>
              @if (sharingRows().length > 10) {
                <tr>
                  <td [attr.colspan]="1 + operationColumns().length" class="py-2">
                    <p-columnFilter
                      type="text"
                      field="label"
                      matchMode="contains"
                      placeholder="Type to search"
                      ariaLabel="Filter group"
                      filterOn="input"
                    ></p-columnFilter>
                  </td>
                </tr>
              }
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
  `,
  standalone: true,
  imports: [
    ButtonModule,
    DialogModule,
    CheckboxModule,
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
  readonly sharingResponse = signal<SharingResponse | null>(null);
  readonly sharingRows = signal<SharingPrivilegeRow[]>([]);
  readonly reservedSharingRows = signal<SharingPrivilegeRow[]>([]);
  readonly operationColumns = signal<string[]>(OPERATION_COLUMNS_ORDER);
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly loadError = signal<string | null>(null);
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
    return this.isLoading() || !!this.loadError();
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
  }
}
