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
 * @interface GnDatasetLayerGeomField
 */
export interface GnDatasetLayerGeomField {
    /**
     * 
     * @type {string}
     * @memberof GnDatasetLayerGeomField
     */
    name?: string;
    /**
     * 
     * @type {string}
     * @memberof GnDatasetLayerGeomField
     */
    type?: string;
    /**
     * 
     * @type {boolean}
     * @memberof GnDatasetLayerGeomField
     */
    nullable?: boolean;
    /**
     * 
     * @type {string}
     * @memberof GnDatasetLayerGeomField
     */
    defaultValue?: string;
    /**
     * 
     * @type {Array<number>}
     * @memberof GnDatasetLayerGeomField
     */
    extent?: Array<number>;
    /**
     * 
     * @type {string}
     * @memberof GnDatasetLayerGeomField
     */
    crs?: string;
}

/**
 * Check if a given object implements the GnDatasetLayerGeomField interface.
 */
export function instanceOfGnDatasetLayerGeomField(value: object): value is GnDatasetLayerGeomField {
    return true;
}

export function GnDatasetLayerGeomFieldFromJSON(json: any): GnDatasetLayerGeomField {
    return GnDatasetLayerGeomFieldFromJSONTyped(json, false);
}

export function GnDatasetLayerGeomFieldFromJSONTyped(json: any, ignoreDiscriminator: boolean): GnDatasetLayerGeomField {
    if (json == null) {
        return json;
    }
    return {
        
        'name': json['name'] == null ? undefined : json['name'],
        'type': json['type'] == null ? undefined : json['type'],
        'nullable': json['nullable'] == null ? undefined : json['nullable'],
        'defaultValue': json['defaultValue'] == null ? undefined : json['defaultValue'],
        'extent': json['extent'] == null ? undefined : json['extent'],
        'crs': json['crs'] == null ? undefined : json['crs'],
    };
}

export function GnDatasetLayerGeomFieldToJSON(value?: GnDatasetLayerGeomField | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'name': value['name'],
        'type': value['type'],
        'nullable': value['nullable'],
        'defaultValue': value['defaultValue'],
        'extent': value['extent'],
        'crs': value['crs'],
    };
}

