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
import type { OgcApiRecordsLinkTemplateDto } from './OgcApiRecordsLinkTemplateDto';
import {
    OgcApiRecordsLinkTemplateDtoFromJSON,
    OgcApiRecordsLinkTemplateDtoFromJSONTyped,
    OgcApiRecordsLinkTemplateDtoToJSON,
} from './OgcApiRecordsLinkTemplateDto';
import type { OgcApiRecordsRecordGeoJSONDto } from './OgcApiRecordsRecordGeoJSONDto';
import {
    OgcApiRecordsRecordGeoJSONDtoFromJSON,
    OgcApiRecordsRecordGeoJSONDtoFromJSONTyped,
    OgcApiRecordsRecordGeoJSONDtoToJSON,
} from './OgcApiRecordsRecordGeoJSONDto';
import type { OgcApiRecordsLinkDto } from './OgcApiRecordsLinkDto';
import {
    OgcApiRecordsLinkDtoFromJSON,
    OgcApiRecordsLinkDtoFromJSONTyped,
    OgcApiRecordsLinkDtoToJSON,
} from './OgcApiRecordsLinkDto';

/**
 * 
 * @export
 * @interface OgcApiRecordsGetRecords200ResponseDto
 */
export interface OgcApiRecordsGetRecords200ResponseDto {
    /**
     * 
     * @type {string}
     * @memberof OgcApiRecordsGetRecords200ResponseDto
     */
    type: OgcApiRecordsGetRecords200ResponseDtoTypeEnum;
    /**
     * 
     * @type {Array<OgcApiRecordsRecordGeoJSONDto>}
     * @memberof OgcApiRecordsGetRecords200ResponseDto
     */
    features: Array<OgcApiRecordsRecordGeoJSONDto>;
    /**
     * 
     * @type {Array<OgcApiRecordsLinkDto>}
     * @memberof OgcApiRecordsGetRecords200ResponseDto
     */
    links?: Array<OgcApiRecordsLinkDto>;
    /**
     * 
     * @type {Date}
     * @memberof OgcApiRecordsGetRecords200ResponseDto
     */
    timeStamp?: Date;
    /**
     * 
     * @type {number}
     * @memberof OgcApiRecordsGetRecords200ResponseDto
     */
    numberMatched?: number;
    /**
     * 
     * @type {number}
     * @memberof OgcApiRecordsGetRecords200ResponseDto
     */
    numberReturned?: number;
    /**
     * 
     * @type {Array<OgcApiRecordsLinkTemplateDto>}
     * @memberof OgcApiRecordsGetRecords200ResponseDto
     */
    linkTemplates?: Array<OgcApiRecordsLinkTemplateDto>;
}


/**
 * @export
 */
export const OgcApiRecordsGetRecords200ResponseDtoTypeEnum = {
    FeatureCollection: 'FeatureCollection'
} as const;
export type OgcApiRecordsGetRecords200ResponseDtoTypeEnum = typeof OgcApiRecordsGetRecords200ResponseDtoTypeEnum[keyof typeof OgcApiRecordsGetRecords200ResponseDtoTypeEnum];


/**
 * Check if a given object implements the OgcApiRecordsGetRecords200ResponseDto interface.
 */
export function instanceOfOgcApiRecordsGetRecords200ResponseDto(value: object): value is OgcApiRecordsGetRecords200ResponseDto {
    if (!('type' in value) || value['type'] === undefined) return false;
    if (!('features' in value) || value['features'] === undefined) return false;
    return true;
}

export function OgcApiRecordsGetRecords200ResponseDtoFromJSON(json: any): OgcApiRecordsGetRecords200ResponseDto {
    return OgcApiRecordsGetRecords200ResponseDtoFromJSONTyped(json, false);
}

export function OgcApiRecordsGetRecords200ResponseDtoFromJSONTyped(json: any, ignoreDiscriminator: boolean): OgcApiRecordsGetRecords200ResponseDto {
    if (json == null) {
        return json;
    }
    return {
        
        'type': json['type'],
        'features': ((json['features'] as Array<any>).map(OgcApiRecordsRecordGeoJSONDtoFromJSON)),
        'links': json['links'] == null ? undefined : ((json['links'] as Array<any>).map(OgcApiRecordsLinkDtoFromJSON)),
        'timeStamp': json['timeStamp'] == null ? undefined : (new Date(json['timeStamp'])),
        'numberMatched': json['numberMatched'] == null ? undefined : json['numberMatched'],
        'numberReturned': json['numberReturned'] == null ? undefined : json['numberReturned'],
        'linkTemplates': json['linkTemplates'] == null ? undefined : ((json['linkTemplates'] as Array<any>).map(OgcApiRecordsLinkTemplateDtoFromJSON)),
    };
}

export function OgcApiRecordsGetRecords200ResponseDtoToJSON(value?: OgcApiRecordsGetRecords200ResponseDto | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'type': value['type'],
        'features': ((value['features'] as Array<any>).map(OgcApiRecordsRecordGeoJSONDtoToJSON)),
        'links': value['links'] == null ? undefined : ((value['links'] as Array<any>).map(OgcApiRecordsLinkDtoToJSON)),
        'timeStamp': value['timeStamp'] == null ? undefined : ((value['timeStamp']).toISOString()),
        'numberMatched': value['numberMatched'],
        'numberReturned': value['numberReturned'],
        'linkTemplates': value['linkTemplates'] == null ? undefined : ((value['linkTemplates'] as Array<any>).map(OgcApiRecordsLinkTemplateDtoToJSON)),
    };
}

