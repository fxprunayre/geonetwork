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

/**
 *
 * @export
 */
export const ReservedGroup = {
  All: 'all',
  Intranet: 'intranet',
  Guest: 'guest',
} as const;
export type ReservedGroup = (typeof ReservedGroup)[keyof typeof ReservedGroup];

export function instanceOfReservedGroup(value: any): boolean {
  for (const key in ReservedGroup) {
    if (Object.prototype.hasOwnProperty.call(ReservedGroup, key)) {
      if ((ReservedGroup as Record<string, ReservedGroup>)[key] === value) {
        return true;
      }
    }
  }
  return false;
}

export function ReservedGroupFromJSON(json: any): ReservedGroup {
  return ReservedGroupFromJSONTyped(json, false);
}

export function ReservedGroupFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean
): ReservedGroup {
  return json as ReservedGroup;
}

export function ReservedGroupToJSON(value?: ReservedGroup | null): any {
  return value as any;
}
