import { Component, inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ConfigService } from '../modules/config/config-service';
import { PrimeShadowdomstyleComponent } from './p-shadowdomstyle-component';

@Component({
  selector: 'gc-base-component',
  template: '<div></div>',
  providers: [],
})
export class BaseComponent extends PrimeShadowdomstyleComponent implements OnInit, OnChanges {
  @Input({ alias: 'api-url' }) apiUrl: string = '/geonetwork';
  @Input() space: string = 'srv';

  configService = inject(ConfigService);

  override ngOnInit() {
    super.ngOnInit();
  }

  ngOnChanges(changes: SimpleChanges): void {
    Object.keys(changes).forEach((prop) => {
      if (prop == 'apiUrl') {
        this.apiUrl = changes['apiUrl'].currentValue;
        this.configService.updateConfiguration(this.apiUrl, this.space);
      } else if (prop == 'space') {
        this.space = changes['space'].currentValue;
        this.configService.updateConfiguration(this.apiUrl, this.space);
      }
    });
  }
}
