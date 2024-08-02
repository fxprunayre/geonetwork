/* tslint:disable */
/* eslint-disable */

/**
 * GeoNetwork API
 * This API exposes endpoints to GeoNetwork API.
 *
 * The version of the OpenAPI document: 1.0
 * Contact: geonetwork-users@lists.sourceforge.net
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

/**
 *
 * @export
 * @interface GnThesaurus
 */
export interface GnThesaurus {
  /**
   *
   * @type {string}
   * @memberof GnThesaurus
   */
  id?: string;
  /**
   *
   * @type {string}
   * @memberof GnThesaurus
   */
  title?: string;
  /**
   *
   * @type {{ [key: string]: string; }}
   * @memberof GnThesaurus
   */
  multilingualTitle?: { [key: string]: string };
  /**
   *
   * @type {string}
   * @memberof GnThesaurus
   */
  theme?: string;
  /**
   *
   * @type {string}
   * @memberof GnThesaurus
   */
  link?: string;
  /**
   *
   * @type {Array<object>}
   * @memberof GnThesaurus
   */
  keywords?: Array<object>;
}

/**
 * Check if a given object implements the GnThesaurus interface.
 */
export function instanceOfGnThesaurus(value: object): value is GnThesaurus {
  return true;
}

export function GnThesaurusFromJSON(json: any): GnThesaurus {
  return GnThesaurusFromJSONTyped(json, false);
}

export function GnThesaurusFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean
): GnThesaurus {
  if (json == null) {
    return json;
  }
  return {
    id: json['id'] == null ? undefined : json['id'],
    title: json['title'] == null ? undefined : json['title'],
    multilingualTitle:
      json['multilingualTitle'] == null ? undefined : json['multilingualTitle'],
    theme: json['theme'] == null ? undefined : json['theme'],
    link: json['link'] == null ? undefined : json['link'],
    keywords: json['keywords'] == null ? undefined : json['keywords'],
  };
}

export function GnThesaurusToJSON(value?: GnThesaurus | null): any {
  if (value == null) {
    return value;
  }
  return {
    id: value['id'],
    title: value['title'],
    multilingualTitle: value['multilingualTitle'],
    theme: value['theme'],
    link: value['link'],
    keywords: value['keywords'],
  };
}
