/* tslint:disable */
/* eslint-disable */
/**
 * GeoNetwork 4.4.5 OpenAPI Documentation
 * This is the description of the GeoNetwork OpenAPI. Use this API to manage your catalog.
 *
 * The version of the OpenAPI document: 4.4.5
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
 * @interface Operation
 */
export interface Operation {
  /**
   *
   * @type {number}
   * @memberof Operation
   */
  id?: number;
  /**
   *
   * @type {{ [key: string]: string; }}
   * @memberof Operation
   */
  label?: { [key: string]: string };
  /**
   *
   * @type {string}
   * @memberof Operation
   */
  name?: string;
  /**
   *
   * @type {boolean}
   * @memberof Operation
   */
  reserved?: boolean;
  /**
   *
   * @type {string}
   * @memberof Operation
   */
  reservedOperation?: OperationReservedOperationEnum;
}

/**
 * @export
 */
export const OperationReservedOperationEnum = {
  View: 'view',
  Download: 'download',
  Editing: 'editing',
  Notify: 'notify',
  Dynamic: 'dynamic',
  Featured: 'featured',
} as const;
export type OperationReservedOperationEnum =
  (typeof OperationReservedOperationEnum)[keyof typeof OperationReservedOperationEnum];

/**
 * Check if a given object implements the Operation interface.
 */
export function instanceOfOperation(value: object): value is Operation {
  return true;
}

export function OperationFromJSON(json: any): Operation {
  return OperationFromJSONTyped(json, false);
}

export function OperationFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean
): Operation {
  if (json == null) {
    return json;
  }
  return {
    id: json['id'] == null ? undefined : json['id'],
    label: json['label'] == null ? undefined : json['label'],
    name: json['name'] == null ? undefined : json['name'],
    reserved: json['reserved'] == null ? undefined : json['reserved'],
    reservedOperation:
      json['reservedOperation'] == null ? undefined : json['reservedOperation'],
  };
}

export function OperationToJSON(value?: Operation | null): any {
  if (value == null) {
    return value;
  }
  return {
    id: value['id'],
    label: value['label'],
    name: value['name'],
    reserved: value['reserved'],
    reservedOperation: value['reservedOperation'],
  };
}
