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
 * @interface RasterCornerCoordinates
 */
export interface RasterCornerCoordinates {
    /**
     * 
     * @type {Array<number>}
     * @memberof RasterCornerCoordinates
     */
    upperLeft?: Array<number>;
    /**
     * 
     * @type {Array<number>}
     * @memberof RasterCornerCoordinates
     */
    upperRight?: Array<number>;
    /**
     * 
     * @type {Array<number>}
     * @memberof RasterCornerCoordinates
     */
    lowerLeft?: Array<number>;
    /**
     * 
     * @type {Array<number>}
     * @memberof RasterCornerCoordinates
     */
    lowerRight?: Array<number>;
    /**
     * 
     * @type {Array<number>}
     * @memberof RasterCornerCoordinates
     */
    center?: Array<number>;
}

/**
 * Check if a given object implements the RasterCornerCoordinates interface.
 */
export function instanceOfRasterCornerCoordinates(value: object): value is RasterCornerCoordinates {
    return true;
}

export function RasterCornerCoordinatesFromJSON(json: any): RasterCornerCoordinates {
    return RasterCornerCoordinatesFromJSONTyped(json, false);
}

export function RasterCornerCoordinatesFromJSONTyped(json: any, ignoreDiscriminator: boolean): RasterCornerCoordinates {
    if (json == null) {
        return json;
    }
    return {
        
        'upperLeft': json['upperLeft'] == null ? undefined : json['upperLeft'],
        'upperRight': json['upperRight'] == null ? undefined : json['upperRight'],
        'lowerLeft': json['lowerLeft'] == null ? undefined : json['lowerLeft'],
        'lowerRight': json['lowerRight'] == null ? undefined : json['lowerRight'],
        'center': json['center'] == null ? undefined : json['center'],
    };
}

export function RasterCornerCoordinatesToJSON(value?: RasterCornerCoordinates | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'upperLeft': value['upperLeft'],
        'upperRight': value['upperRight'],
        'lowerLeft': value['lowerLeft'],
        'lowerRight': value['lowerRight'],
        'center': value['center'],
    };
}

