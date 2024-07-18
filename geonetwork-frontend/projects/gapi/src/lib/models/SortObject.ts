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
 * @interface SortObject
 */
export interface SortObject {
  /**
   *
   * @type {boolean}
   * @memberof SortObject
   */
  ascending?: boolean;
  /**
   *
   * @type {string}
   * @memberof SortObject
   */
  direction?: string;
  /**
   *
   * @type {boolean}
   * @memberof SortObject
   */
  ignoreCase?: boolean;
  /**
   *
   * @type {string}
   * @memberof SortObject
   */
  nullHandling?: string;
  /**
   *
   * @type {string}
   * @memberof SortObject
   */
  property?: string;
}

/**
 * Check if a given object implements the SortObject interface.
 */
export function instanceOfSortObject(value: object): value is SortObject {
  return true;
}

export function SortObjectFromJSON(json: any): SortObject {
  return SortObjectFromJSONTyped(json, false);
}

export function SortObjectFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean
): SortObject {
  if (json == null) {
    return json;
  }
  return {
    ascending: json['ascending'] == null ? undefined : json['ascending'],
    direction: json['direction'] == null ? undefined : json['direction'],
    ignoreCase: json['ignoreCase'] == null ? undefined : json['ignoreCase'],
    nullHandling:
      json['nullHandling'] == null ? undefined : json['nullHandling'],
    property: json['property'] == null ? undefined : json['property'],
  };
}

export function SortObjectToJSON(value?: SortObject | null): any {
  if (value == null) {
    return value;
  }
  return {
    ascending: value['ascending'],
    direction: value['direction'],
    ignoreCase: value['ignoreCase'],
    nullHandling: value['nullHandling'],
    property: value['property'],
  };
}
