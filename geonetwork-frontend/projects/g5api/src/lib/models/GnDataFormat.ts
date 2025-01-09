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
 * @interface GnDataFormat
 */
export interface GnDataFormat {
    /**
     * 
     * @type {string}
     * @memberof GnDataFormat
     */
    name?: string;
    /**
     * 
     * @type {string}
     * @memberof GnDataFormat
     */
    dataType?: string;
    /**
     * 
     * @type {string}
     * @memberof GnDataFormat
     */
    rwFlag?: string;
    /**
     * 
     * @type {string}
     * @memberof GnDataFormat
     */
    description?: string;
}

/**
 * Check if a given object implements the GnDataFormat interface.
 */
export function instanceOfGnDataFormat(value: object): value is GnDataFormat {
    return true;
}

export function GnDataFormatFromJSON(json: any): GnDataFormat {
    return GnDataFormatFromJSONTyped(json, false);
}

export function GnDataFormatFromJSONTyped(json: any, ignoreDiscriminator: boolean): GnDataFormat {
    if (json == null) {
        return json;
    }
    return {
        
        'name': json['name'] == null ? undefined : json['name'],
        'dataType': json['dataType'] == null ? undefined : json['dataType'],
        'rwFlag': json['rwFlag'] == null ? undefined : json['rwFlag'],
        'description': json['description'] == null ? undefined : json['description'],
    };
}

export function GnDataFormatToJSON(value?: GnDataFormat | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'name': value['name'],
        'dataType': value['dataType'],
        'rwFlag': value['rwFlag'],
        'description': value['description'],
    };
}

