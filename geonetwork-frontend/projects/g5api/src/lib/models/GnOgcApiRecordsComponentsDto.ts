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
 * @interface GnOgcApiRecordsComponentsDto
 */
export interface GnOgcApiRecordsComponentsDto {
    /**
     * 
     * @type {object}
     * @memberof GnOgcApiRecordsComponentsDto
     */
    schemas?: object;
    /**
     * 
     * @type {object}
     * @memberof GnOgcApiRecordsComponentsDto
     */
    responses?: object;
    /**
     * 
     * @type {object}
     * @memberof GnOgcApiRecordsComponentsDto
     */
    parameters?: object;
    /**
     * 
     * @type {object}
     * @memberof GnOgcApiRecordsComponentsDto
     */
    examples?: object;
    /**
     * 
     * @type {object}
     * @memberof GnOgcApiRecordsComponentsDto
     */
    requestBodies?: object;
    /**
     * 
     * @type {object}
     * @memberof GnOgcApiRecordsComponentsDto
     */
    headers?: object;
    /**
     * 
     * @type {object}
     * @memberof GnOgcApiRecordsComponentsDto
     */
    securitySchemes?: object;
    /**
     * 
     * @type {object}
     * @memberof GnOgcApiRecordsComponentsDto
     */
    links?: object;
    /**
     * 
     * @type {object}
     * @memberof GnOgcApiRecordsComponentsDto
     */
    callbacks?: object;
}

/**
 * Check if a given object implements the GnOgcApiRecordsComponentsDto interface.
 */
export function instanceOfGnOgcApiRecordsComponentsDto(value: object): value is GnOgcApiRecordsComponentsDto {
    return true;
}

export function GnOgcApiRecordsComponentsDtoFromJSON(json: any): GnOgcApiRecordsComponentsDto {
    return GnOgcApiRecordsComponentsDtoFromJSONTyped(json, false);
}

export function GnOgcApiRecordsComponentsDtoFromJSONTyped(json: any, ignoreDiscriminator: boolean): GnOgcApiRecordsComponentsDto {
    if (json == null) {
        return json;
    }
    return {
        
        'schemas': json['schemas'] == null ? undefined : json['schemas'],
        'responses': json['responses'] == null ? undefined : json['responses'],
        'parameters': json['parameters'] == null ? undefined : json['parameters'],
        'examples': json['examples'] == null ? undefined : json['examples'],
        'requestBodies': json['requestBodies'] == null ? undefined : json['requestBodies'],
        'headers': json['headers'] == null ? undefined : json['headers'],
        'securitySchemes': json['securitySchemes'] == null ? undefined : json['securitySchemes'],
        'links': json['links'] == null ? undefined : json['links'],
        'callbacks': json['callbacks'] == null ? undefined : json['callbacks'],
    };
}

export function GnOgcApiRecordsComponentsDtoToJSON(value?: GnOgcApiRecordsComponentsDto | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'schemas': value['schemas'],
        'responses': value['responses'],
        'parameters': value['parameters'],
        'examples': value['examples'],
        'requestBodies': value['requestBodies'],
        'headers': value['headers'],
        'securitySchemes': value['securitySchemes'],
        'links': value['links'],
        'callbacks': value['callbacks'],
    };
}

