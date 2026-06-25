import { Component, effect, inject, model, output, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidCheck, faSolidXmark } from '@ng-icons/font-awesome/solid';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { GroupPrivilege, RecordsService, SharingResponse } from 'gn4-api-client';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { OverlayBadge } from 'primeng/overlaybadge';
import { TableModule } from 'primeng/table';
import { RecordFieldBase } from '../../../record/record-field-base/record-field-base';

interface SharingPrivilegeRow {
  groupId: number | null;
  groupLabel: string;
  operations: Record<string, boolean>;
  reserved?: boolean;
  restricted?: boolean;
  userGroup?: boolean;
}

@Component({
  selector: 'app-record-sharing-by-group-panel',
  template: `
    <p-dialog
      class="m-10 w-full max-w-4xl"
      [(visible)]="visible"
      [modal]="true"
      [header]="'record.action.sharing.byGroup.label' | translate"
      (onHide)="reset()"
    >
      <div class="flex flex-col gap-4">
        <p>{{ 'record.action.sharing.byGroup.help' | translate }}</p>
        @if (isLoading()) {
          <p>Loading sharing settings...</p>
        } @else if (loadError()) {
          <p class="text-red-600">{{ loadError() }}</p>
        } @else if (sharingRows().length > 0 || reservedSharingRows().length > 0) {
          <p-table
            #table
            [value]="sharingRows()"
            [frozenValue]="reservedSharingRows()"
            [globalFilterFields]="['groupLabel']"
            sortField="groupLabel"
            [sortOrder]="1"
            styleClass="p-datatable-sm"
          >
            <ng-template #header>
              <tr>
                <th pSortableColumn="groupLabel" class="text-left p-2">
                  Group
                  <p-sortIcon field="groupLabel" />
                </th>
                @for (operation of operationColumns(); track operation) {
                  <th [pSortableColumn]="'operations.' + operation" class="text-left p-2">
                    {{ operation }}
                    <p-sortIcon [field]="'operations.' + operation" />
                  </th>
                }
              </tr>
            </ng-template>

            <ng-template #body let-rowData>
              <tr>
                <td class="p-2">
                  {{ rowData.groupLabel }}
                </td>
                @for (operation of operationColumns(); track operation) {
                  <td class="p-2">
                    <input
                      #checkbox
                      type="checkbox"
                      [checked]="isChecked(rowData, operation)"
                      (change)="toggleOperation(rowData.groupId, operation, checkbox.checked)"
                    />
                  </td>
                }
              </tr>
            </ng-template>

            <ng-template #frozenbody let-rowData>
              <tr [style.backgroundColor]="rowData.reserved ? 'var(--p-primary-100)' : ''">
                <td class="p-2">
                  {{ rowData.groupLabel }}
                </td>
                @for (operation of operationColumns(); track operation) {
                  <td class="p-2">
                    <input
                      #checkbox
                      type="checkbox"
                      [checked]="isChecked(rowData, operation)"
                      (change)="toggleOperation(rowData.groupId, operation, checkbox.checked)"
                    />
                  </td>
                }
              </tr>
            </ng-template>
          </p-table>
        }
      </div>
      <div class="flex flex-col gap-4 mt-4">
        <ng-content />
      </div>

      <ng-template pTemplate="footer">
        <p-button (onClick)="close()">
          <ng-icon name="faSolidXmark" pButtonIcon></ng-icon>
          <span pButtonLabel>{{ 'cancel' | translate }}</span>
        </p-button>
        <p-button (onClick)="confirm()" [disabled]="isFormInvalid()">
          <ng-icon name="faSolidCheck" pButtonIcon></ng-icon>
          <span pButtonLabel>{{ 'save' | translate }}</span>
        </p-button>
      </ng-template>
    </p-dialog>
  `,
  standalone: true,
  imports: [
    ButtonModule,
    DialogModule,
    InputTextModule,
    OverlayBadge,
    TableModule,
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
  onConfirm = output<void>();

  private readonly recordsService = inject(RecordsService);
  private readonly translate = inject(TranslateService);
  readonly sharingResponse = signal<SharingResponse | null>(null);
  readonly sharingRows = signal<SharingPrivilegeRow[]>([]);
  readonly reservedSharingRows = signal<SharingPrivilegeRow[]>([]);
  readonly operationColumns = signal<string[]>([]);
  readonly isLoading = signal(false);
  readonly loadError = signal<string | null>(null);

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

  initializeMatrix(privileges: GroupPrivilege[]) {
    const operationSet = new Set<string>();
    const rows: SharingPrivilegeRow[] = privileges.map((privilege) => {
      const operations = { ...(privilege.operations ?? {}) };
      Object.keys(operations).forEach((operation) => operationSet.add(operation));
      return {
        groupId: privilege.group ?? null,
        groupLabel: privilege.group ? this.translate.instant(`group-${privilege.group}`) : 'N/A',
        operations,
        reserved: privilege.reserved,
        restricted: privilege.restricted,
        userGroup: privilege.userGroup,
      };
    });

    this.operationColumns.set(Array.from(operationSet).sort((a, b) => a.localeCompare(b)));

    const sortedRows = [...rows].sort((a, b) => a.groupLabel.localeCompare(b.groupLabel));
    this.reservedSharingRows.set(sortedRows.filter((row) => !!row.reserved));
    this.sharingRows.set(sortedRows.filter((row) => !row.reserved));
  }

  isChecked(row: SharingPrivilegeRow, operation: string): boolean {
    return !!row.operations[operation];
  }

  toggleOperation(groupId: number | null, operation: string, checked: boolean) {
    const updateRow = (rows: SharingPrivilegeRow[]) =>
      rows.map((row) => {
        if (row.groupId !== groupId) {
          return row;
        }
        return {
          ...row,
          operations: {
            ...row.operations,
            [operation]: checked,
          },
        };
      });

    this.sharingRows.update(updateRow);
    this.reservedSharingRows.update(updateRow);
  }

  confirm() {
    if (this.isFormInvalid()) {
      return;
    }
    this.onConfirm.emit();
    this.close();
  }

  close() {
    this.visible.set(false);
    this.reset();
  }

  reset() {
    this.loadError.set(null);
  }
}
