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
import type { Helper } from './Helper';
import { HelperFromJSON, HelperFromJSONTyped, HelperToJSON } from './Helper';

/**
 *
 * @export
 * @interface Element
 */
export interface Element {
  /**
   *
   * @type {string}
   * @memberof Element
   */
  condition?: string;
  /**
   *
   * @type {string}
   * @memberof Element
   */
  context?: string;
  /**
   *
   * @type {string}
   * @memberof Element
   */
  description?: string;
  /**
   *
   * @type {string}
   * @memberof Element
   */
  example?: string;
  /**
   *
   * @type {string}
   * @memberof Element
   */
  help?: string;
  /**
   *
   * @type {Helper}
   * @memberof Element
   */
  helper?: Helper;
  /**
   *
   * @type {number}
   * @memberof Element
   */
  id?: number;
  /**
   *
   * @type {string}
   * @memberof Element
   */
  label: string;
  /**
   *
   * @type {string}
   * @memberof Element
   */
  name?: string;
}

/**
 * Check if a given object implements the Element interface.
 */
export function instanceOfElement(value: object): value is Element {
  if (!('label' in value) || value['label'] === undefined) return false;
  return true;
}

export function ElementFromJSON(json: any): Element {
  return ElementFromJSONTyped(json, false);
}

export function ElementFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean
): Element {
  if (json == null) {
    return json;
  }
  return {
    condition: json['condition'] == null ? undefined : json['condition'],
    context: json['context'] == null ? undefined : json['context'],
    description: json['description'] == null ? undefined : json['description'],
    example: json['example'] == null ? undefined : json['example'],
    help: json['help'] == null ? undefined : json['help'],
    helper: json['helper'] == null ? undefined : HelperFromJSON(json['helper']),
    id: json['id'] == null ? undefined : json['id'],
    label: json['label'],
    name: json['name'] == null ? undefined : json['name'],
  };
}

export function ElementToJSON(value?: Element | null): any {
  if (value == null) {
    return value;
  }
  return {
    condition: value['condition'],
    context: value['context'],
    description: value['description'],
    example: value['example'],
    help: value['help'],
    helper: HelperToJSON(value['helper']),
    id: value['id'],
    label: value['label'],
    name: value['name'],
  };
}
