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
 * A list of available distributions of the resource.
 * @export
 * @interface OgcApiRecordsFormatDto
 */
export interface OgcApiRecordsFormatDto {
    /**
     * 
     * @type {string}
     * @memberof OgcApiRecordsFormatDto
     */
    name?: string;
    /**
     * 
     * @type {string}
     * @memberof OgcApiRecordsFormatDto
     */
    mediaType?: string;
}

/**
 * Check if a given object implements the OgcApiRecordsFormatDto interface.
 */
export function instanceOfOgcApiRecordsFormatDto(value: object): value is OgcApiRecordsFormatDto {
    return true;
}

export function OgcApiRecordsFormatDtoFromJSON(json: any): OgcApiRecordsFormatDto {
    return OgcApiRecordsFormatDtoFromJSONTyped(json, false);
}

export function OgcApiRecordsFormatDtoFromJSONTyped(json: any, ignoreDiscriminator: boolean): OgcApiRecordsFormatDto {
    if (json == null) {
        return json;
    }
    return {
        
        'name': json['name'] == null ? undefined : json['name'],
        'mediaType': json['mediaType'] == null ? undefined : json['mediaType'],
    };
}

export function OgcApiRecordsFormatDtoToJSON(value?: OgcApiRecordsFormatDto | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'name': value['name'],
        'mediaType': value['mediaType'],
    };
}

