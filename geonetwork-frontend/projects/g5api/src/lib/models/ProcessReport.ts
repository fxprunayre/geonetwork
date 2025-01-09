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
 * @interface ProcessReport
 */
export interface ProcessReport {
    /**
     * 
     * @type {string}
     * @memberof ProcessReport
     */
    status?: string;
    /**
     * 
     * @type {string}
     * @memberof ProcessReport
     */
    errorMessage?: string;
}

/**
 * Check if a given object implements the ProcessReport interface.
 */
export function instanceOfProcessReport(value: object): value is ProcessReport {
    return true;
}

export function ProcessReportFromJSON(json: any): ProcessReport {
    return ProcessReportFromJSONTyped(json, false);
}

export function ProcessReportFromJSONTyped(json: any, ignoreDiscriminator: boolean): ProcessReport {
    if (json == null) {
        return json;
    }
    return {
        
        'status': json['status'] == null ? undefined : json['status'],
        'errorMessage': json['errorMessage'] == null ? undefined : json['errorMessage'],
    };
}

export function ProcessReportToJSON(value?: ProcessReport | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'status': value['status'],
        'errorMessage': value['errorMessage'],
    };
}

