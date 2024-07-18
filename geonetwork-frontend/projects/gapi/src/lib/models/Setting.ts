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
 * @interface Setting
 */
export interface Setting {
  /**
   *
   * @type {string}
   * @memberof Setting
   */
  dataType?: SettingDataTypeEnum;
  /**
   *
   * @type {boolean}
   * @memberof Setting
   */
  editable?: boolean;
  /**
   *
   * @type {string}
   * @memberof Setting
   */
  editableJpaWorkaround?: string;
  /**
   *
   * @type {boolean}
   * @memberof Setting
   */
  encrypted?: boolean;
  /**
   *
   * @type {string}
   * @memberof Setting
   */
  encryptedJpaWorkaround?: string;
  /**
   *
   * @type {boolean}
   * @memberof Setting
   */
  internal?: boolean;
  /**
   *
   * @type {string}
   * @memberof Setting
   */
  internalJpaWorkaround?: string;
  /**
   *
   * @type {string}
   * @memberof Setting
   */
  name?: string;
  /**
   *
   * @type {number}
   * @memberof Setting
   */
  position?: number;
  /**
   *
   * @type {string}
   * @memberof Setting
   */
  storedValue?: string;
  /**
   *
   * @type {string}
   * @memberof Setting
   */
  value?: string;
}

/**
 * @export
 */
export const SettingDataTypeEnum = {
  String: 'STRING',
  Int: 'INT',
  Boolean: 'BOOLEAN',
  Json: 'JSON',
} as const;
export type SettingDataTypeEnum =
  (typeof SettingDataTypeEnum)[keyof typeof SettingDataTypeEnum];

/**
 * Check if a given object implements the Setting interface.
 */
export function instanceOfSetting(value: object): value is Setting {
  return true;
}

export function SettingFromJSON(json: any): Setting {
  return SettingFromJSONTyped(json, false);
}

export function SettingFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean
): Setting {
  if (json == null) {
    return json;
  }
  return {
    dataType: json['dataType'] == null ? undefined : json['dataType'],
    editable: json['editable'] == null ? undefined : json['editable'],
    editableJpaWorkaround:
      json['editable_JpaWorkaround'] == null
        ? undefined
        : json['editable_JpaWorkaround'],
    encrypted: json['encrypted'] == null ? undefined : json['encrypted'],
    encryptedJpaWorkaround:
      json['encrypted_JpaWorkaround'] == null
        ? undefined
        : json['encrypted_JpaWorkaround'],
    internal: json['internal'] == null ? undefined : json['internal'],
    internalJpaWorkaround:
      json['internal_JpaWorkaround'] == null
        ? undefined
        : json['internal_JpaWorkaround'],
    name: json['name'] == null ? undefined : json['name'],
    position: json['position'] == null ? undefined : json['position'],
    storedValue: json['storedValue'] == null ? undefined : json['storedValue'],
    value: json['value'] == null ? undefined : json['value'],
  };
}

export function SettingToJSON(value?: Setting | null): any {
  if (value == null) {
    return value;
  }
  return {
    dataType: value['dataType'],
    editable: value['editable'],
    editable_JpaWorkaround: value['editableJpaWorkaround'],
    encrypted: value['encrypted'],
    encrypted_JpaWorkaround: value['encryptedJpaWorkaround'],
    internal: value['internal'],
    internal_JpaWorkaround: value['internalJpaWorkaround'],
    name: value['name'],
    position: value['position'],
    storedValue: value['storedValue'],
    value: value['value'],
  };
}
