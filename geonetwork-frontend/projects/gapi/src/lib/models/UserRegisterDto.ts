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
import type { Address } from './Address';
import {
  AddressFromJSON,
  AddressFromJSONTyped,
  AddressToJSON,
} from './Address';

/**
 * User details
 * @export
 * @interface UserRegisterDto
 */
export interface UserRegisterDto {
  /**
   *
   * @type {Address}
   * @memberof UserRegisterDto
   */
  address?: Address;
  /**
   *
   * @type {string}
   * @memberof UserRegisterDto
   */
  captcha?: string;
  /**
   *
   * @type {string}
   * @memberof UserRegisterDto
   */
  email?: string;
  /**
   *
   * @type {string}
   * @memberof UserRegisterDto
   */
  name?: string;
  /**
   *
   * @type {string}
   * @memberof UserRegisterDto
   */
  organisation?: string;
  /**
   *
   * @type {string}
   * @memberof UserRegisterDto
   */
  profile?: string;
  /**
   *
   * @type {string}
   * @memberof UserRegisterDto
   */
  surname?: string;
  /**
   *
   * @type {string}
   * @memberof UserRegisterDto
   */
  username?: string;
}

/**
 * Check if a given object implements the UserRegisterDto interface.
 */
export function instanceOfUserRegisterDto(
  value: object
): value is UserRegisterDto {
  return true;
}

export function UserRegisterDtoFromJSON(json: any): UserRegisterDto {
  return UserRegisterDtoFromJSONTyped(json, false);
}

export function UserRegisterDtoFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean
): UserRegisterDto {
  if (json == null) {
    return json;
  }
  return {
    address:
      json['address'] == null ? undefined : AddressFromJSON(json['address']),
    captcha: json['captcha'] == null ? undefined : json['captcha'],
    email: json['email'] == null ? undefined : json['email'],
    name: json['name'] == null ? undefined : json['name'],
    organisation:
      json['organisation'] == null ? undefined : json['organisation'],
    profile: json['profile'] == null ? undefined : json['profile'],
    surname: json['surname'] == null ? undefined : json['surname'],
    username: json['username'] == null ? undefined : json['username'],
  };
}

export function UserRegisterDtoToJSON(value?: UserRegisterDto | null): any {
  if (value == null) {
    return value;
  }
  return {
    address: AddressToJSON(value['address']),
    captcha: value['captcha'],
    email: value['email'],
    name: value['name'],
    organisation: value['organisation'],
    profile: value['profile'],
    surname: value['surname'],
    username: value['username'],
  };
}
