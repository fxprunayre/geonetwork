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
 * 
 * @export
 * @interface GnCrsDetails
 */
export interface GnCrsDetails {
    /**
     * 
     * @type {string}
     * @memberof GnCrsDetails
     */
    code?: string;
    /**
     * 
     * @type {string}
     * @memberof GnCrsDetails
     */
    codeSpace?: string;
    /**
     * 
     * @type {string}
     * @memberof GnCrsDetails
     */
    name?: string;
    /**
     * 
     * @type {string}
     * @memberof GnCrsDetails
     */
    url?: string;
}

/**
 * Check if a given object implements the GnCrsDetails interface.
 */
export function instanceOfGnCrsDetails(value: object): value is GnCrsDetails {
    return true;
}

export function GnCrsDetailsFromJSON(json: any): GnCrsDetails {
    return GnCrsDetailsFromJSONTyped(json, false);
}

export function GnCrsDetailsFromJSONTyped(json: any, ignoreDiscriminator: boolean): GnCrsDetails {
    if (json == null) {
        return json;
    }
    return {
        
        'code': json['code'] == null ? undefined : json['code'],
        'codeSpace': json['codeSpace'] == null ? undefined : json['codeSpace'],
        'name': json['name'] == null ? undefined : json['name'],
        'url': json['url'] == null ? undefined : json['url'],
    };
}

export function GnCrsDetailsToJSON(value?: GnCrsDetails | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'code': value['code'],
        'codeSpace': value['codeSpace'],
        'name': value['name'],
        'url': value['url'],
    };
}

