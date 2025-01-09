/* tslint:disable */
/* eslint-disable */
/**
 * GeoNetwork API
 * This API exposes endpoints to GeoNetwork API.
 *
 * The version of the OpenAPI document: 5.0.0
 * Contact: geonetwork-users@lists.sourceforge.net
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { mapValues } from '../runtime';
/**
 * The language used for textual values in this record.
 * @export
 * @interface Language
 */
export interface Language {
    /**
     * The language tag as per RFC-5646.
     * @type {string}
     * @memberof Language
     */
    code: string;
    /**
     * The untranslated name of of the language.
     * @type {string}
     * @memberof Language
     */
    name?: string;
    /**
     * The name of the language in another well-understood language, usually English.
     * @type {string}
     * @memberof Language
     */
    alternate?: string;
    /**
     * The direction for text in this language. The default, `ltr` (left-to-right), represents the most common situation. However, care should be taken to set the value of `dir` appropriately if the language direction is not `ltr`. Other values supported are `rtl` (right-to-left), `ttb` (top-to-bottom), and `btt` (bottom-to-top).
     * @type {string}
     * @memberof Language
     */
    dir?: LanguageDirEnum;
}


/**
 * @export
 */
export const LanguageDirEnum = {
    Ltr: 'ltr',
    Rtl: 'rtl',
    Ttb: 'ttb',
    Btt: 'btt'
} as const;
export type LanguageDirEnum = typeof LanguageDirEnum[keyof typeof LanguageDirEnum];


/**
 * Check if a given object implements the Language interface.
 */
export function instanceOfLanguage(value: object): value is Language {
    if (!('code' in value) || value['code'] === undefined) return false;
    return true;
}

export function LanguageFromJSON(json: any): Language {
    return LanguageFromJSONTyped(json, false);
}

export function LanguageFromJSONTyped(json: any, ignoreDiscriminator: boolean): Language {
    if (json == null) {
        return json;
    }
    return {
        
        'code': json['code'],
        'name': json['name'] == null ? undefined : json['name'],
        'alternate': json['alternate'] == null ? undefined : json['alternate'],
        'dir': json['dir'] == null ? undefined : json['dir'],
    };
}

export function LanguageToJSON(value?: Language | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'code': value['code'],
        'name': value['name'],
        'alternate': value['alternate'],
        'dir': value['dir'],
    };
}
