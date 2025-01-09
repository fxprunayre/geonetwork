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
import type { GnDatasetLayer } from './GnGnDatasetLayer';
import {
    GnDatasetLayerFromJSON,
    GnDatasetLayerFromJSONTyped,
    GnDatasetLayerToJSON,
} from './GnGnDatasetLayer';

/**
 * 
 * @export
 * @interface GnDatasetInfo
 */
export interface GnDatasetInfo {
    /**
     * 
     * @type {string}
     * @memberof GnDatasetInfo
     */
    description?: string;
    /**
     * 
     * @type {string}
     * @memberof GnDatasetInfo
     */
    format?: string;
    /**
     * 
     * @type {string}
     * @memberof GnDatasetInfo
     */
    formatDescription?: string;
    /**
     * 
     * @type {string}
     * @memberof GnDatasetInfo
     */
    dataType?: GnDatasetInfoDataTypeEnum;
    /**
     * 
     * @type {Array<GnDatasetLayer>}
     * @memberof GnDatasetInfo
     */
    layers?: Array<GnDatasetLayer>;
    /**
     * 
     * @type {{ [key: string]: object; }}
     * @memberof GnDatasetInfo
     */
    metadata?: { [key: string]: object; };
}


/**
 * @export
 */
export const GnDatasetInfoDataTypeEnum = {
    Raster: 'RASTER',
    Vector: 'VECTOR'
} as const;
export type GnDatasetInfoDataTypeEnum = typeof GnDatasetInfoDataTypeEnum[keyof typeof GnDatasetInfoDataTypeEnum];


/**
 * Check if a given object implements the GnDatasetInfo interface.
 */
export function instanceOfGnDatasetInfo(value: object): value is GnDatasetInfo {
    return true;
}

export function GnDatasetInfoFromJSON(json: any): GnDatasetInfo {
    return GnDatasetInfoFromJSONTyped(json, false);
}

export function GnDatasetInfoFromJSONTyped(json: any, ignoreDiscriminator: boolean): GnDatasetInfo {
    if (json == null) {
        return json;
    }
    return {
        
        'description': json['description'] == null ? undefined : json['description'],
        'format': json['format'] == null ? undefined : json['format'],
        'formatDescription': json['formatDescription'] == null ? undefined : json['formatDescription'],
        'dataType': json['dataType'] == null ? undefined : json['dataType'],
        'layers': json['layers'] == null ? undefined : ((json['layers'] as Array<any>).map(GnDatasetLayerFromJSON)),
        'metadata': json['metadata'] == null ? undefined : json['metadata'],
    };
}

export function GnDatasetInfoToJSON(value?: GnDatasetInfo | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'description': value['description'],
        'format': value['format'],
        'formatDescription': value['formatDescription'],
        'dataType': value['dataType'],
        'layers': value['layers'] == null ? undefined : ((value['layers'] as Array<any>).map(GnDatasetLayerToJSON)),
        'metadata': value['metadata'],
    };
}

