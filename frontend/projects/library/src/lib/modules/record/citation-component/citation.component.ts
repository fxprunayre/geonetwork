import { Component, computed, effect, inject, input, OnChanges, signal } from '@angular/core';
import { RecordsService } from 'gn4-api-client';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ToastModule } from 'primeng/toast';
import { ButtonDirective } from 'primeng/button';
import { Card } from 'primeng/card';
import { faSolidQuoteRight, faSolidDownload } from '@ng-icons/font-awesome/solid';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { CopyInput } from '../../../shared/widgets/copy-input/copy-input';
import { TabsModule } from 'primeng/tabs';
import { Panel } from 'primeng/panel';
import { SelectButton } from 'primeng/selectbutton';
import { MessageService } from 'primeng/api';
import { Skeleton } from 'primeng/skeleton';

interface FormatOption {
  id: string;
  label: string;
}

@Component({
  selector: 'app-citation-component',
  standalone: true,
  templateUrl: './citation.component.html',
  imports: [
    FormsModule,
    CommonModule,
    TranslatePipe,
    ToastModule,
    ButtonDirective,
    Card,
    NgIcon,
    CopyInput,
    TabsModule,
    SelectButton,
    Panel,
    Skeleton,
  ],
  providers: [MessageService],
  viewProviders: [provideIcons({ faSolidQuoteRight, faSolidDownload })],
})
export class CitationComponent implements OnChanges {
  uuid = input.required<string>();
  format = input('html');

  private readonly translateService = inject(TranslateService);
  private recordService = inject(RecordsService);

  constructor() {
    effect(() => {
      if (this.uuid()) {
        this.loadFormats();
      }
    });
  }

  formats = signal<FormatOption[]>([]);
  citationText = signal<string>('');
  currentFormat = signal<string>('html');
  citationAvailable = signal(false);
  loading = signal(false);

  ngOnChanges() {
    //if (!this.uuid()) return;
    //this.loadFormats();
  }

  private fetchCitation(
    output: 'html' | 'json' | 'txt' | 'xml' | 'jsonld' | 'pdf' | 'testpdf' | undefined,
    params?: Record<string, any>,
    accept?:
      | 'text/html'
      | 'text/plain'
      | 'application/json'
      | 'application/pdf'
      | 'application/rdf+xml'
      | 'application/vnd.schemaorg.ld+json'
      | 'application/xhtml+xml'
      | 'application/xml',
  ) {
    return this.recordService.getRecordFormattedBy(
      'citation',
      this.uuid(),
      undefined,
      undefined,
      undefined,
      output,
      true,
      params,
      undefined,
      false,
      accept ? { httpHeaderAccept: accept } : undefined,
    );
  }

  loadFormats() {
    this.fetchCitation('json', { format: '?' }).subscribe({
      next: (resp: any) => {
        const arr: string[] = Array.isArray(resp) ? resp : (resp?.formats ?? []);

        this.formats.set(
          arr.map((f: string) => ({
            id: f,
            label: f.toUpperCase(),
          })),
        );

        this.citationAvailable.set(arr.length > 0);

        if (!arr.length) return;

        const initial = arr.includes('html') ? 'html' : arr[0];
        this.getCitation(initial);
      },
      error: (err: any) => {
        console.error('Error loading citation formats', err);
        this.citationAvailable.set(false);
      },
    });
  }

  getCitation(fmt: string) {
    this.currentFormat.set(fmt);
    this.loading.set(true);

    const output = fmt === 'html' ? 'html' : 'txt';

    const params = fmt === 'html' ? undefined : { format: fmt };

    const accept = this.mapAccept(fmt);

    this.fetchCitation(output, params, accept).subscribe({
      next: (resp: any) => {
        this.citationText.set(typeof resp === 'string' ? resp : JSON.stringify(resp));
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Error loading citation for', fmt, err);
        this.citationText.set('');
        this.loading.set(false);
      },
    });
  }

  isCode = computed(() => {
    const f = this.currentFormat();
    return f === 'json' || f === 'bibtex' || f === 'ris';
  });

  filename = computed(() => {
    return `citation-${this.uuid()}.${this.currentFormat()}`;
  });

  private mapAccept(
    fmt: string,
  ):
    | 'text/html'
    | 'text/plain'
    | 'application/json'
    | 'application/pdf'
    | 'application/rdf+xml'
    | 'application/vnd.schemaorg.ld+json'
    | 'application/xhtml+xml'
    | 'application/xml'
    | undefined {
    switch (fmt) {
      case 'html':
        return 'text/html';
      default:
        return 'text/plain';
    }
  }

  onFormatChange(fmt: string) {
    this.currentFormat.set(fmt);
    this.getCitation(fmt);
  }

  protected readonly encodeURIComponent = encodeURIComponent;
}
