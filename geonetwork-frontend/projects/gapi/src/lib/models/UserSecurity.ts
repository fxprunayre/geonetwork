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
 * @interface UserSecurity
 */
export interface UserSecurity {
  /**
   *
   * @type {string}
   * @memberof UserSecurity
   */
  authType?: string;
  /**
   *
   * @type {string}
   * @memberof UserSecurity
   */
  nodeId?: string;
  /**
   *
   * @type {Set<string>}
   * @memberof UserSecurity
   */
  securityNotifications?: Set<UserSecuritySecurityNotificationsEnum>;
  /**
   *
   * @type {UserSecurity}
   * @memberof UserSecurity
   */
  securityNotificationsString?: UserSecurity;
}

/**
 * @export
 */
export const UserSecuritySecurityNotificationsEnum = {
  UpdateHashRequired: 'UPDATE_HASH_REQUIRED',
  Unknown: 'UNKNOWN',
} as const;
export type UserSecuritySecurityNotificationsEnum =
  (typeof UserSecuritySecurityNotificationsEnum)[keyof typeof UserSecuritySecurityNotificationsEnum];

/**
 * Check if a given object implements the UserSecurity interface.
 */
export function instanceOfUserSecurity(value: object): value is UserSecurity {
  return true;
}

export function UserSecurityFromJSON(json: any): UserSecurity {
  return UserSecurityFromJSONTyped(json, false);
}

export function UserSecurityFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean
): UserSecurity {
  if (json == null) {
    return json;
  }
  return {
    authType: json['authType'] == null ? undefined : json['authType'],
    nodeId: json['nodeId'] == null ? undefined : json['nodeId'],
    securityNotifications:
      json['securityNotifications'] == null
        ? undefined
        : json['securityNotifications'],
    securityNotificationsString:
      json['securityNotificationsString'] == null
        ? undefined
        : UserSecurityFromJSON(json['securityNotificationsString']),
  };
}

export function UserSecurityToJSON(value?: UserSecurity | null): any {
  if (value == null) {
    return value;
  }
  return {
    authType: value['authType'],
    nodeId: value['nodeId'],
    securityNotifications:
      value['securityNotifications'] == null
        ? undefined
        : Array.from(value['securityNotifications'] as Set<any>),
    securityNotificationsString: UserSecurityToJSON(
      value['securityNotificationsString']
    ),
  };
}
