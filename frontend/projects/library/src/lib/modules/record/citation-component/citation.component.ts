import {Component, Input, OnChanges, signal, computed, inject} from '@angular/core';
import { RecordsService } from 'gn4-api-client';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

interface FormatOption {
  id: string;
  label: string;
}

@Component({
  selector: 'app-citation-component',
  standalone: true,
  templateUrl: './citation.component.html',
  imports: [FormsModule, CommonModule, TranslatePipe, ToastModule],
  providers: [MessageService],
})
export class CitationComponent implements OnChanges {
  @Input({ required: true }) uuid!: string;
  @Input() format: string = 'html';

  private readonly translateService = inject(TranslateService);

  formats = signal<FormatOption[]>([]);
  citationText = signal<string>('');
  currentFormat = signal<string>('html');
  citationAvailable = signal(false);
  loading = signal(false);

  constructor(
    private recordService: RecordsService,
    private messageService: MessageService
  ) {}

  ngOnChanges() {
    if (!this.uuid) return;
    this.loadFormats();
  }

  private fetchCitation(
    output: 'html' | 'json' | 'txt' | 'xml' | 'jsonld' | 'pdf' | 'testpdf' | undefined,
    params?: Record<string, any>,
    accept?: string,
  ) {
    return this.recordService.getRecordFormattedBy(
      'citation',
      this.uuid,
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
      error: (err) => {
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
      error: (err) => {
        console.error('Error loading citation for', fmt, err);
        this.citationText.set('Error loading citation.');
        this.loading.set(false);
      },
    });
  }

  isCode = computed(() => {
    const f = this.currentFormat();
    return f === 'json' || f === 'bibtex' || f === 'ris';
  });

  getFilename() {
    return `citation-${this.uuid}.${this.currentFormat()}`;
  }

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

  copyToClipboard() {
    navigator.clipboard.writeText(this.citationText());

    this.messageService.add({
      severity: 'success',
      summary: this.translateService.instant('citation.copy_title'),
      detail: this.translateService.instant('citation.copy_detail'),
      life: 1500,
    });
  }

  protected readonly encodeURIComponent = encodeURIComponent;
}
