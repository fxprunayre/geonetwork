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

import * as runtime from '../runtime';
import type { StatusValue } from '../models/index';
import { StatusValueFromJSON, StatusValueToJSON } from '../models/index';

export interface GetStatusByTypeRequest {
  type: GetStatusByTypeTypeEnum;
}

/**
 *
 */
export class StatusApi extends runtime.BaseAPI {
  /**
   * Delete all record history and status
   */
  async deleteAllHistoryAndStatusRaw(
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<runtime.ApiResponse<void>> {
    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    const response = await this.request(
      {
        path: `/status`,
        method: 'DELETE',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Delete all record history and status
   */
  async deleteAllHistoryAndStatus(
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<void> {
    await this.deleteAllHistoryAndStatusRaw(initOverrides);
  }

  /**
   * Get status by type
   */
  async getStatusByTypeRaw(
    requestParameters: GetStatusByTypeRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<runtime.ApiResponse<Array<StatusValue>>> {
    if (requestParameters['type'] == null) {
      throw new runtime.RequiredError(
        'type',
        'Required parameter "type" was null or undefined when calling getStatusByType().'
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    const response = await this.request(
      {
        path: `/status/{type}`.replace(
          `{${'type'}}`,
          encodeURIComponent(String(requestParameters['type']))
        ),
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides
    );

    return new runtime.JSONApiResponse(response, jsonValue =>
      jsonValue.map(StatusValueFromJSON)
    );
  }

  /**
   * Get status by type
   */
  async getStatusByType(
    requestParameters: GetStatusByTypeRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<Array<StatusValue>> {
    const response = await this.getStatusByTypeRaw(
      requestParameters,
      initOverrides
    );
    return await response.value();
  }

  /**
   * Get status
   */
  async getStatusListRaw(
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<runtime.ApiResponse<Array<StatusValue>>> {
    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    const response = await this.request(
      {
        path: `/status`,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides
    );

    return new runtime.JSONApiResponse(response, jsonValue =>
      jsonValue.map(StatusValueFromJSON)
    );
  }

  /**
   * Get status
   */
  async getStatusList(
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<Array<StatusValue>> {
    const response = await this.getStatusListRaw(initOverrides);
    return await response.value();
  }
}

/**
 * @export
 */
export const GetStatusByTypeTypeEnum = {
  Workflow: 'workflow',
  Task: 'task',
  Event: 'event',
} as const;
export type GetStatusByTypeTypeEnum =
  (typeof GetStatusByTypeTypeEnum)[keyof typeof GetStatusByTypeTypeEnum];
