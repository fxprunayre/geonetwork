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
 * @interface UserGroupsResponse
 */
export interface UserGroupsResponse {
  /**
   *
   * @type {number}
   * @memberof UserGroupsResponse
   */
  groupId?: number;
  /**
   *
   * @type {string}
   * @memberof UserGroupsResponse
   */
  groupName?: string;
  /**
   *
   * @type {number}
   * @memberof UserGroupsResponse
   */
  userId?: number;
  /**
   *
   * @type {string}
   * @memberof UserGroupsResponse
   */
  userName?: string;
  /**
   *
   * @type {string}
   * @memberof UserGroupsResponse
   */
  userProfile?: string;
}

/**
 * Check if a given object implements the UserGroupsResponse interface.
 */
export function instanceOfUserGroupsResponse(
  value: object
): value is UserGroupsResponse {
  return true;
}

export function UserGroupsResponseFromJSON(json: any): UserGroupsResponse {
  return UserGroupsResponseFromJSONTyped(json, false);
}

export function UserGroupsResponseFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean
): UserGroupsResponse {
  if (json == null) {
    return json;
  }
  return {
    groupId: json['groupId'] == null ? undefined : json['groupId'],
    groupName: json['groupName'] == null ? undefined : json['groupName'],
    userId: json['userId'] == null ? undefined : json['userId'],
    userName: json['userName'] == null ? undefined : json['userName'],
    userProfile: json['userProfile'] == null ? undefined : json['userProfile'],
  };
}

export function UserGroupsResponseToJSON(
  value?: UserGroupsResponse | null
): any {
  if (value == null) {
    return value;
  }
  return {
    groupId: value['groupId'],
    groupName: value['groupName'],
    userId: value['userId'],
    userName: value['userName'],
    userProfile: value['userProfile'],
  };
}
