import { HttpClient } from '@angular/common/http';
import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
import { Configuration } from './configuration';

@NgModule({
  imports: [],
  declarations: [],
  exports: [],
  providers: [],
})
export class Gn4ApiModule {
  public static forRoot(
    configurationFactory: () => Configuration,
  ): ModuleWithProviders<Gn4ApiModule> {
    return {
      ngModule: Gn4ApiModule,
      providers: [{ provide: Configuration, useFactory: configurationFactory }],
    };
  }

  constructor(@Optional() @SkipSelf() parentModule: Gn4ApiModule, @Optional() http: HttpClient) {
    if (parentModule) {
      throw new Error('Gn4ApiModule is already loaded. Import in your base AppModule only.');
    }
    if (!http) {
      throw new Error(
        'You need to import the HttpClientModule in your AppModule! \n' +
          'See also https://github.com/angular/angular/issues/20575',
      );
    }
  }
}
