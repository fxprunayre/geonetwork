import { inject, Injectable } from '@angular/core';
import { APPLICATION_CONFIGURATION } from '../../config.loader';
import { App, Apps } from '../../model/gnConfig';

@Injectable()
export class ConfigEditorStateService {
  readonly appConfig = inject(APPLICATION_CONFIGURATION);

  getFieldValue(appName: keyof Apps, path: string): unknown {
    const app = this.appConfig().config?.apps?.[appName] as Record<string, unknown> | undefined;
    if (!app) {
      return undefined;
    }
    return this.getNestedValue(app, path);
  }

  updateField(appName: keyof Apps, path: string, value: unknown): void {
    const current = this.appConfig();
    const currentApp = current.config?.apps?.[appName] as
      | (App & Record<string, unknown>)
      | undefined;
    if (!currentApp || !current.config?.apps) {
      return;
    }

    const nextApp = structuredClone(currentApp) as App & Record<string, unknown>;
    this.setNestedValue(nextApp, path, value);

    this.appConfig.set({
      ...current,
      config: {
        ...current.config,
        apps: {
          ...current.config.apps,
          [appName]: nextApp,
        },
      },
    });
  }

  updateRawConfig(jsonValue: string): void {
    try {
      this.appConfig.set(JSON.parse(jsonValue));
    } catch {
      // Ignore parse errors while typing.
    }
  }

  private getNestedValue(source: Record<string, unknown>, path: string): unknown {
    return path
      .split('.')
      .reduce<unknown>(
        (acc, key) =>
          acc && typeof acc === 'object' ? (acc as Record<string, unknown>)[key] : undefined,
        source,
      );
  }

  private setNestedValue(source: Record<string, unknown>, path: string, value: unknown): void {
    const segments = path.split('.');
    const lastSegment = segments.pop();
    if (!lastSegment) {
      return;
    }

    let cursor: Record<string, unknown> = source;
    for (const segment of segments) {
      const nestedValue = cursor[segment];
      if (!nestedValue || typeof nestedValue !== 'object' || Array.isArray(nestedValue)) {
        cursor[segment] = {};
      }
      cursor = cursor[segment] as Record<string, unknown>;
    }

    cursor[lastSegment] = value;
  }
}
