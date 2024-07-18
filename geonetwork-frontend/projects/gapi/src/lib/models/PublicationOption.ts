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
import type { ReservedOperation } from './ReservedOperation';
import {
  ReservedOperationFromJSON,
  ReservedOperationFromJSONTyped,
  ReservedOperationToJSON,
} from './ReservedOperation';
import type { ReservedGroup } from './ReservedGroup';
import {
  ReservedGroupFromJSON,
  ReservedGroupFromJSONTyped,
  ReservedGroupToJSON,
} from './ReservedGroup';

/**
 *
 * @export
 * @interface PublicationOption
 */
export interface PublicationOption {
  /**
   *
   * @type {{ [key: string]: Array<ReservedOperation>; }}
   * @memberof PublicationOption
   */
  additionalPublications?: { [key: string]: Array<ReservedOperation> };
  /**
   *
   * @type {string}
   * @memberof PublicationOption
   */
  name?: string;
  /**
   *
   * @type {ReservedGroup}
   * @memberof PublicationOption
   */
  publicationGroup?: ReservedGroup;
  /**
   *
   * @type {Array<ReservedOperation>}
   * @memberof PublicationOption
   */
  publicationOperations?: Array<ReservedOperation>;
}

/**
 * Check if a given object implements the PublicationOption interface.
 */
export function instanceOfPublicationOption(
  value: object
): value is PublicationOption {
  return true;
}

export function PublicationOptionFromJSON(json: any): PublicationOption {
  return PublicationOptionFromJSONTyped(json, false);
}

export function PublicationOptionFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean
): PublicationOption {
  if (json == null) {
    return json;
  }
  return {
    additionalPublications:
      json['additionalPublications'] == null
        ? undefined
        : json['additionalPublications'],
    name: json['name'] == null ? undefined : json['name'],
    publicationGroup:
      json['publicationGroup'] == null
        ? undefined
        : ReservedGroupFromJSON(json['publicationGroup']),
    publicationOperations:
      json['publicationOperations'] == null
        ? undefined
        : (json['publicationOperations'] as Array<any>).map(
            ReservedOperationFromJSON
          ),
  };
}

export function PublicationOptionToJSON(value?: PublicationOption | null): any {
  if (value == null) {
    return value;
  }
  return {
    additionalPublications: value['additionalPublications'],
    name: value['name'],
    publicationGroup: ReservedGroupToJSON(value['publicationGroup']),
    publicationOperations:
      value['publicationOperations'] == null
        ? undefined
        : (value['publicationOperations'] as Array<any>).map(
            ReservedOperationToJSON
          ),
  };
}
