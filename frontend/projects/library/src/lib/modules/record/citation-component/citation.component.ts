import { Component, Input, OnChanges, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { ButtonGroupModule } from 'primeng/buttongroup';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-citation',
  standalone: true,
  imports: [CommonModule, ButtonModule, ButtonGroupModule, ToastModule],
  providers: [MessageService],
  templateUrl: './citation.component.html',
})
export class CitationComponent implements OnChanges {
  @Input() format: string = 'html';
  @Input({ required: true }) uuid!: string;

  formats = signal<{ id: string; label: string; help?: string }[]>([]);
  currentFormat = signal<string | null>(null);
  citationText = signal<string>('');
  citationAvailable = signal(false);

  isCode = computed(() => ['ris', 'bibtex'].includes(this.currentFormat() ?? ''));

  constructor(
    private http: HttpClient,
    private toast: MessageService,
  ) {}

  ngOnChanges() {
    if (this.uuid) this.loadCitation();
  }

  private buildUrl() {
    // return `/catalogue/srv/api/records/${this.uuid}/formatters/citation?format=`;
    // TO DO WHAT URL??
  }

  loadCitation() {
    this.citationAvailable.set(false);

    this.getCitation('?').then(() => {
      this.getCitation(this.format);
    });
  }

  async getCitation(format: string) {
    const url = this.buildUrl() + format;

    if (format === '?') {
      const data = await this.http.get<string[]>(url).toPromise();
      if (!data) return;

      const fmt = data.map((id) => ({
        id,
        label: id.toUpperCase(),
        help: '',
      }));

      this.formats.set(fmt);
      return;
    }

    const data = await this.http.get(url, { responseType: 'text' }).toPromise();

    this.currentFormat.set(format);
    this.citationText.set(data ?? '');
    this.citationAvailable.set(true);
  }

  getFilename() {
    const f = this.currentFormat() ?? 'txt';
    const ext = f === 'text' ? 'txt' : f;
    return `citation-${this.uuid}.${ext}`;
  }

  copy() {
    navigator.clipboard.writeText(this.citationText());
    this.toast.add({
      severity: 'success',
      summary: 'Copied',
      detail: 'Citation copied to clipboard',
    });
  }

  protected readonly navigator = navigator;
  protected readonly encodeURIComponent = encodeURIComponent;
}
