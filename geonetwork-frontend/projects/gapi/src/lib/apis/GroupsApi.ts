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
import type { Group, User } from '../models/index';
import {
  GroupFromJSON,
  GroupToJSON,
  UserFromJSON,
  UserToJSON,
} from '../models/index';

export interface AddGroupRequest {
  group: Group;
}

export interface DeleteGroupRequest {
  groupIdentifier: number;
  force?: boolean;
}

export interface GetGroupRequest {
  groupIdentifier: number;
}

export interface GetGroupLogoRequest {
  groupId: number;
}

export interface GetGroupUsersRequest {
  groupIdentifier: number;
}

export interface GetGroupsRequest {
  withReservedGroup?: boolean;
  profile?: string;
}

export interface UpdateGroupRequest {
  groupIdentifier: number;
  group: Group;
}

/**
 *
 */
export class GroupsApi extends runtime.BaseAPI {
  /**
   * Return the identifier of the group created.
   * Add a group
   */
  async addGroupRaw(
    requestParameters: AddGroupRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<runtime.ApiResponse<number>> {
    if (requestParameters['group'] == null) {
      throw new runtime.RequiredError(
        'group',
        'Required parameter "group" was null or undefined when calling addGroup().'
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    headerParameters['Content-Type'] = 'application/json';

    const response = await this.request(
      {
        path: `/groups`,
        method: 'PUT',
        headers: headerParameters,
        query: queryParameters,
        body: GroupToJSON(requestParameters['group']),
      },
      initOverrides
    );

    if (this.isJsonMime(response.headers.get('content-type'))) {
      return new runtime.JSONApiResponse<number>(response);
    } else {
      return new runtime.TextApiResponse(response) as any;
    }
  }

  /**
   * Return the identifier of the group created.
   * Add a group
   */
  async addGroup(
    requestParameters: AddGroupRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<number> {
    const response = await this.addGroupRaw(requestParameters, initOverrides);
    return await response.value();
  }

  /**
   * Remove a group by first removing sharing settings, link to users and finally reindex all affected records.
   * Remove a group
   */
  async deleteGroupRaw(
    requestParameters: DeleteGroupRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['groupIdentifier'] == null) {
      throw new runtime.RequiredError(
        'groupIdentifier',
        'Required parameter "groupIdentifier" was null or undefined when calling deleteGroup().'
      );
    }

    const queryParameters: any = {};

    if (requestParameters['force'] != null) {
      queryParameters['force'] = requestParameters['force'];
    }

    const headerParameters: runtime.HTTPHeaders = {};

    const response = await this.request(
      {
        path: `/groups/{groupIdentifier}`.replace(
          `{${'groupIdentifier'}}`,
          encodeURIComponent(String(requestParameters['groupIdentifier']))
        ),
        method: 'DELETE',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Remove a group by first removing sharing settings, link to users and finally reindex all affected records.
   * Remove a group
   */
  async deleteGroup(
    requestParameters: DeleteGroupRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<void> {
    await this.deleteGroupRaw(requestParameters, initOverrides);
  }

  /**
   * Return the requested group details.
   * Get group
   */
  async getGroupRaw(
    requestParameters: GetGroupRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<runtime.ApiResponse<Group>> {
    if (requestParameters['groupIdentifier'] == null) {
      throw new runtime.RequiredError(
        'groupIdentifier',
        'Required parameter "groupIdentifier" was null or undefined when calling getGroup().'
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    const response = await this.request(
      {
        path: `/groups/{groupIdentifier}`.replace(
          `{${'groupIdentifier'}}`,
          encodeURIComponent(String(requestParameters['groupIdentifier']))
        ),
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides
    );

    return new runtime.JSONApiResponse(response, jsonValue =>
      GroupFromJSON(jsonValue)
    );
  }

  /**
   * Return the requested group details.
   * Get group
   */
  async getGroup(
    requestParameters: GetGroupRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<Group> {
    const response = await this.getGroupRaw(requestParameters, initOverrides);
    return await response.value();
  }

  /**
   * If last-modified header is present it is used to check if the logo has been modified since the header date. If it hasn\'t been modified returns an empty 304 Not Modified response. If modified returns the image. If the group has no logo then returns a transparent 1x1 px PNG image.
   * Get the group logo image.
   */
  async getGroupLogoRaw(
    requestParameters: GetGroupLogoRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['groupId'] == null) {
      throw new runtime.RequiredError(
        'groupId',
        'Required parameter "groupId" was null or undefined when calling getGroupLogo().'
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    const response = await this.request(
      {
        path: `/groups/{groupId}/logo`.replace(
          `{${'groupId'}}`,
          encodeURIComponent(String(requestParameters['groupId']))
        ),
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * If last-modified header is present it is used to check if the logo has been modified since the header date. If it hasn\'t been modified returns an empty 304 Not Modified response. If modified returns the image. If the group has no logo then returns a transparent 1x1 px PNG image.
   * Get the group logo image.
   */
  async getGroupLogo(
    requestParameters: GetGroupLogoRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<void> {
    await this.getGroupLogoRaw(requestParameters, initOverrides);
  }

  /**
   * Get group users
   */
  async getGroupUsersRaw(
    requestParameters: GetGroupUsersRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<runtime.ApiResponse<Array<User>>> {
    if (requestParameters['groupIdentifier'] == null) {
      throw new runtime.RequiredError(
        'groupIdentifier',
        'Required parameter "groupIdentifier" was null or undefined when calling getGroupUsers().'
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    const response = await this.request(
      {
        path: `/groups/{groupIdentifier}/users`.replace(
          `{${'groupIdentifier'}}`,
          encodeURIComponent(String(requestParameters['groupIdentifier']))
        ),
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides
    );

    return new runtime.JSONApiResponse(response, jsonValue =>
      jsonValue.map(UserFromJSON)
    );
  }

  /**
   * Get group users
   */
  async getGroupUsers(
    requestParameters: GetGroupUsersRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<Array<User>> {
    const response = await this.getGroupUsersRaw(
      requestParameters,
      initOverrides
    );
    return await response.value();
  }

  /**
   * The catalog contains one or more groups. By default, there is 3 reserved groups (Internet, Intranet, Guest) and a sample group.<br/>This service returns all catalog groups when not authenticated or when current is user is an administrator. The list can contains or not reserved groups depending on the parameters.<br/>When authenticated, return user groups optionally filtered on a specific user profile.
   * Get groups
   */
  async getGroupsRaw(
    requestParameters: GetGroupsRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<runtime.ApiResponse<Array<Group>>> {
    const queryParameters: any = {};

    if (requestParameters['withReservedGroup'] != null) {
      queryParameters['withReservedGroup'] =
        requestParameters['withReservedGroup'];
    }

    if (requestParameters['profile'] != null) {
      queryParameters['profile'] = requestParameters['profile'];
    }

    const headerParameters: runtime.HTTPHeaders = {};

    const response = await this.request(
      {
        path: `/groups`,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides
    );

    return new runtime.JSONApiResponse(response, jsonValue =>
      jsonValue.map(GroupFromJSON)
    );
  }

  /**
   * The catalog contains one or more groups. By default, there is 3 reserved groups (Internet, Intranet, Guest) and a sample group.<br/>This service returns all catalog groups when not authenticated or when current is user is an administrator. The list can contains or not reserved groups depending on the parameters.<br/>When authenticated, return user groups optionally filtered on a specific user profile.
   * Get groups
   */
  async getGroups(
    requestParameters: GetGroupsRequest = {},
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<Array<Group>> {
    const response = await this.getGroupsRaw(requestParameters, initOverrides);
    return await response.value();
  }

  /**
   * Update a group
   */
  async updateGroupRaw(
    requestParameters: UpdateGroupRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters['groupIdentifier'] == null) {
      throw new runtime.RequiredError(
        'groupIdentifier',
        'Required parameter "groupIdentifier" was null or undefined when calling updateGroup().'
      );
    }

    if (requestParameters['group'] == null) {
      throw new runtime.RequiredError(
        'group',
        'Required parameter "group" was null or undefined when calling updateGroup().'
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    headerParameters['Content-Type'] = 'application/json';

    const response = await this.request(
      {
        path: `/groups/{groupIdentifier}`.replace(
          `{${'groupIdentifier'}}`,
          encodeURIComponent(String(requestParameters['groupIdentifier']))
        ),
        method: 'PUT',
        headers: headerParameters,
        query: queryParameters,
        body: GroupToJSON(requestParameters['group']),
      },
      initOverrides
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Update a group
   */
  async updateGroup(
    requestParameters: UpdateGroupRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<void> {
    await this.updateGroupRaw(requestParameters, initOverrides);
  }
}
