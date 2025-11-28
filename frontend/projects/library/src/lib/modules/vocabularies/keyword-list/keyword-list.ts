import { Component, input } from '@angular/core';
import { Chip } from 'primeng/chip';
import { Card } from 'primeng/card';

// TODO: Should be in the OpenApi model
export type Keyword = {
  default: string;
  [key: string]: string;
};

@Component({
  selector: 'app-keyword-list',
  imports: [Chip, Card],
  templateUrl: './keyword-list.html',
})
export class KeywordList {
  title = input<string | undefined>();
  keywords = input.required<Keyword[] | undefined>();
}
