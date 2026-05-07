import { HttpClient } from '@angular/common/http';
import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
import { Configuration } from './configuration';

@NgModule({
  imports: [],
  declarations: [],
  exports: [],
  providers: [],
})
export class GnApiModule {
  public static forRoot(
    configurationFactory: () => Configuration,
  ): ModuleWithProviders<GnApiModule> {
    return {
      ngModule: GnApiModule,
      providers: [{ provide: Configuration, useFactory: configurationFactory }],
    };
  }

  constructor(@Optional() @SkipSelf() parentModule: GnApiModule, @Optional() http: HttpClient) {
    if (parentModule) {
      throw new Error('GnApiModule is already loaded. Import in your base AppModule only.');
    }
    if (!http) {
      throw new Error(
        'You need to import the HttpClientModule in your AppModule! \n' +
          'See also https://github.com/angular/angular/issues/20575',
      );
    }
  }
}
