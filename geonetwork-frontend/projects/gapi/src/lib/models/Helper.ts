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
import type { Option } from './Option';
import { OptionFromJSON, OptionFromJSONTyped, OptionToJSON } from './Option';

/**
 *
 * @export
 * @interface Helper
 */
export interface Helper {
  /**
   *
   * @type {string}
   * @memberof Helper
   */
  displayIf?: string;
  /**
   *
   * @type {string}
   * @memberof Helper
   */
  editorMode?: string;
  /**
   *
   * @type {Array<Option>}
   * @memberof Helper
   */
  option: Array<Option>;
  /**
   *
   * @type {string}
   * @memberof Helper
   */
  rel?: string;
  /**
   *
   * @type {string}
   * @memberof Helper
   */
  relAtt?: string;
  /**
   *
   * @type {boolean}
   * @memberof Helper
   */
  sort?: boolean;
}

/**
 * Check if a given object implements the Helper interface.
 */
export function instanceOfHelper(value: object): value is Helper {
  if (!('option' in value) || value['option'] === undefined) return false;
  return true;
}

export function HelperFromJSON(json: any): Helper {
  return HelperFromJSONTyped(json, false);
}

export function HelperFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean
): Helper {
  if (json == null) {
    return json;
  }
  return {
    displayIf: json['displayIf'] == null ? undefined : json['displayIf'],
    editorMode: json['editorMode'] == null ? undefined : json['editorMode'],
    option: (json['option'] as Array<any>).map(OptionFromJSON),
    rel: json['rel'] == null ? undefined : json['rel'],
    relAtt: json['relAtt'] == null ? undefined : json['relAtt'],
    sort: json['sort'] == null ? undefined : json['sort'],
  };
}

export function HelperToJSON(value?: Helper | null): any {
  if (value == null) {
    return value;
  }
  return {
    displayIf: value['displayIf'],
    editorMode: value['editorMode'],
    option: (value['option'] as Array<any>).map(OptionToJSON),
    rel: value['rel'],
    relAtt: value['relAtt'],
    sort: value['sort'],
  };
}
