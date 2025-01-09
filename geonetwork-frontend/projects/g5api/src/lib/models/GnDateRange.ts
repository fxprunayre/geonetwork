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
 * @interface GnDateRange
 */
export interface GnDateRange {
    /**
     * 
     * @type {string}
     * @memberof GnDateRange
     */
    gte?: string;
    /**
     * 
     * @type {string}
     * @memberof GnDateRange
     */
    lte?: string;
}

/**
 * Check if a given object implements the GnDateRange interface.
 */
export function instanceOfGnDateRange(value: object): value is GnDateRange {
    return true;
}

export function GnDateRangeFromJSON(json: any): GnDateRange {
    return GnDateRangeFromJSONTyped(json, false);
}

export function GnDateRangeFromJSONTyped(json: any, ignoreDiscriminator: boolean): GnDateRange {
    if (json == null) {
        return json;
    }
    return {
        
        'gte': json['gte'] == null ? undefined : json['gte'],
        'lte': json['lte'] == null ? undefined : json['lte'],
    };
}

export function GnDateRangeToJSON(value?: GnDateRange | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'gte': value['gte'],
        'lte': value['lte'],
    };
}
