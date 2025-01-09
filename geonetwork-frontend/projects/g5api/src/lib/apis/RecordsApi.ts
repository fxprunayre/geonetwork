/* tslint:disable */
/* eslint-disable */
/**
 * GeoNetwork API
 * This API exposes endpoints to GeoNetwork API.
 *
 * The version of the OpenAPI document: 5.0.0
 * Contact: geonetwork-users@lists.sourceforge.net
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


import * as runtime from '../runtime';
import type {
  BatchEditParameter,
  MetadataResource,
} from '../models/index';
import {
    BatchEditParameterFromJSON,
    BatchEditParameterToJSON,
    MetadataResourceFromJSON,
    MetadataResourceToJSON,
} from '../models/index';

export interface BatchEditRequest {
    batchEditParameter: Array<BatchEditParameter>;
    uuids?: Array<string>;
    bucket?: string;
    updateDateStamp?: boolean;
}

export interface DelResourceRequest {
    metadataUuid: string;
    resourceId: string;
    approved?: boolean;
}

export interface DelResourcesRequest {
    metadataUuid: string;
    approved?: boolean;
}

export interface GetAllResourcesRequest {
    metadataUuid: string;
    sort?: GetAllResourcesSortEnum;
    approved?: boolean;
    filter?: string;
}

export interface GetResourceRequest {
    resourceId: string;
    approved?: boolean;
    size?: number;
}

export interface PatchResourceRequest {
    metadataUuid: string;
    resourceId: string;
    visibility: PatchResourceVisibilityEnum;
    approved?: boolean;
}

export interface PreviewBatchEditRequest {
    batchEditParameter: Array<BatchEditParameter>;
    uuids?: Array<string>;
    bucket?: string;
}

export interface PutResourceRequest {
    metadataUuid: string;
    file: Blob;
    visibility?: PutResourceVisibilityEnum;
    approved?: boolean;
}

export interface PutResourceFromURLRequest {
    metadataUuid: string;
    url: string;
    visibility?: PutResourceFromURLVisibilityEnum;
    approved?: boolean;
}

/**
 * 
 */
export class RecordsApi extends runtime.BaseAPI {

    /**
     * Batch editing API allows to apply multiple edits to one or more record.  **Warning: You can break things here. When defining xpath and using delete or replace mode, be sure to test on a single record before applying changes to a lot of records. If needed, back up your record first and use the preview mode to check the processing.**  Changes are defined on a per standard basis so it is recommended to apply changes on records which are encoded using the same standard.  When applying changes, user privileges apply, so if the user cannot edit a selected record, batch edits will not be applied to that record.  This operations applies the `update-fixed-info.xsl` transformation for the metadata schema and  updates the change date if the parameter `updateDateStamp` is set to `true`.  ## Changes with GeoNetwork 4  * `diffType` not yet supported.  ``` 
     * Batch edit one or more records
     */
    async batchEditRaw(requestParameters: BatchEditRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<object>> {
        if (requestParameters['batchEditParameter'] == null) {
            throw new runtime.RequiredError(
                'batchEditParameter',
                'Required parameter "batchEditParameter" was null or undefined when calling batchEdit().'
            );
        }

        const queryParameters: any = {};

        if (requestParameters['uuids'] != null) {
            queryParameters['uuids'] = requestParameters['uuids'];
        }

        if (requestParameters['bucket'] != null) {
            queryParameters['bucket'] = requestParameters['bucket'];
        }

        if (requestParameters['updateDateStamp'] != null) {
            queryParameters['updateDateStamp'] = requestParameters['updateDateStamp'];
        }

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        const response = await this.request({
            path: `/api/records/batchediting`,
            method: 'PUT',
            headers: headerParameters,
            query: queryParameters,
            body: requestParameters['batchEditParameter']!.map(BatchEditParameterToJSON),
        }, initOverrides);

        return new runtime.JSONApiResponse<any>(response);
    }

    /**
     * Batch editing API allows to apply multiple edits to one or more record.  **Warning: You can break things here. When defining xpath and using delete or replace mode, be sure to test on a single record before applying changes to a lot of records. If needed, back up your record first and use the preview mode to check the processing.**  Changes are defined on a per standard basis so it is recommended to apply changes on records which are encoded using the same standard.  When applying changes, user privileges apply, so if the user cannot edit a selected record, batch edits will not be applied to that record.  This operations applies the `update-fixed-info.xsl` transformation for the metadata schema and  updates the change date if the parameter `updateDateStamp` is set to `true`.  ## Changes with GeoNetwork 4  * `diffType` not yet supported.  ``` 
     * Batch edit one or more records
     */
    async batchEdit(requestParameters: BatchEditRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<object> {
        const response = await this.batchEditRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Delete a metadata resource
     */
    async delResourceRaw(requestParameters: DelResourceRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>> {
        if (requestParameters['metadataUuid'] == null) {
            throw new runtime.RequiredError(
                'metadataUuid',
                'Required parameter "metadataUuid" was null or undefined when calling delResource().'
            );
        }

        if (requestParameters['resourceId'] == null) {
            throw new runtime.RequiredError(
                'resourceId',
                'Required parameter "resourceId" was null or undefined when calling delResource().'
            );
        }

        const queryParameters: any = {};

        if (requestParameters['approved'] != null) {
            queryParameters['approved'] = requestParameters['approved'];
        }

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/api/records/{metadataUuid}/attachments/{resourceId}`.replace(`{${"metadataUuid"}}`, encodeURIComponent(String(requestParameters['metadataUuid']))).replace(`{${"resourceId"}}`, encodeURIComponent(String(requestParameters['resourceId']))),
            method: 'DELETE',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.VoidApiResponse(response);
    }

    /**
     * Delete a metadata resource
     */
    async delResource(requestParameters: DelResourceRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
        await this.delResourceRaw(requestParameters, initOverrides);
    }

    /**
     * Delete all uploaded metadata resources
     */
    async delResourcesRaw(requestParameters: DelResourcesRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>> {
        if (requestParameters['metadataUuid'] == null) {
            throw new runtime.RequiredError(
                'metadataUuid',
                'Required parameter "metadataUuid" was null or undefined when calling delResources().'
            );
        }

        const queryParameters: any = {};

        if (requestParameters['approved'] != null) {
            queryParameters['approved'] = requestParameters['approved'];
        }

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/api/records/{metadataUuid}/attachments`.replace(`{${"metadataUuid"}}`, encodeURIComponent(String(requestParameters['metadataUuid']))),
            method: 'DELETE',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.VoidApiResponse(response);
    }

    /**
     * Delete all uploaded metadata resources
     */
    async delResources(requestParameters: DelResourcesRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
        await this.delResourcesRaw(requestParameters, initOverrides);
    }

    /**
     * <a href=\'https://docs.geonetwork-opensource.org/latest/user-guide/associating-resources/using-filestore/\'>More info</a>
     * List all metadata attachments
     */
    async getAllResourcesRaw(requestParameters: GetAllResourcesRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Array<MetadataResource>>> {
        if (requestParameters['metadataUuid'] == null) {
            throw new runtime.RequiredError(
                'metadataUuid',
                'Required parameter "metadataUuid" was null or undefined when calling getAllResources().'
            );
        }

        const queryParameters: any = {};

        if (requestParameters['sort'] != null) {
            queryParameters['sort'] = requestParameters['sort'];
        }

        if (requestParameters['approved'] != null) {
            queryParameters['approved'] = requestParameters['approved'];
        }

        if (requestParameters['filter'] != null) {
            queryParameters['filter'] = requestParameters['filter'];
        }

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/api/records/{metadataUuid}/attachments`.replace(`{${"metadataUuid"}}`, encodeURIComponent(String(requestParameters['metadataUuid']))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => jsonValue.map(MetadataResourceFromJSON));
    }

    /**
     * <a href=\'https://docs.geonetwork-opensource.org/latest/user-guide/associating-resources/using-filestore/\'>More info</a>
     * List all metadata attachments
     */
    async getAllResources(requestParameters: GetAllResourcesRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Array<MetadataResource>> {
        const response = await this.getAllResourcesRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Get a metadata resource
     */
    async getResourceRaw(requestParameters: GetResourceRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Blob>> {
        if (requestParameters['resourceId'] == null) {
            throw new runtime.RequiredError(
                'resourceId',
                'Required parameter "resourceId" was null or undefined when calling getResource().'
            );
        }

        const queryParameters: any = {};

        if (requestParameters['approved'] != null) {
            queryParameters['approved'] = requestParameters['approved'];
        }

        if (requestParameters['size'] != null) {
            queryParameters['size'] = requestParameters['size'];
        }

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/api/records/{metadataUuid}/attachments/{resourceId}`.replace(`{${"resourceId"}}`, encodeURIComponent(String(requestParameters['resourceId']))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.BlobApiResponse(response);
    }

    /**
     * Get a metadata resource
     */
    async getResource(requestParameters: GetResourceRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Blob> {
        const response = await this.getResourceRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Update the metadata resource visibility
     */
    async patchResourceRaw(requestParameters: PatchResourceRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<MetadataResource>> {
        if (requestParameters['metadataUuid'] == null) {
            throw new runtime.RequiredError(
                'metadataUuid',
                'Required parameter "metadataUuid" was null or undefined when calling patchResource().'
            );
        }

        if (requestParameters['resourceId'] == null) {
            throw new runtime.RequiredError(
                'resourceId',
                'Required parameter "resourceId" was null or undefined when calling patchResource().'
            );
        }

        if (requestParameters['visibility'] == null) {
            throw new runtime.RequiredError(
                'visibility',
                'Required parameter "visibility" was null or undefined when calling patchResource().'
            );
        }

        const queryParameters: any = {};

        if (requestParameters['visibility'] != null) {
            queryParameters['visibility'] = requestParameters['visibility'];
        }

        if (requestParameters['approved'] != null) {
            queryParameters['approved'] = requestParameters['approved'];
        }

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/api/records/{metadataUuid}/attachments/{resourceId}`.replace(`{${"metadataUuid"}}`, encodeURIComponent(String(requestParameters['metadataUuid']))).replace(`{${"resourceId"}}`, encodeURIComponent(String(requestParameters['resourceId']))),
            method: 'PATCH',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => MetadataResourceFromJSON(jsonValue));
    }

    /**
     * Update the metadata resource visibility
     */
    async patchResource(requestParameters: PatchResourceRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<MetadataResource> {
        const response = await this.patchResourceRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Batch editing API allows to apply multiple edits to one or more record.  **Warning: You can break things here. When defining xpath and using delete or replace mode, be sure to test on a single record before applying changes to a lot of records. If needed, back up your record first and use the preview mode to check the processing.**  Changes are defined on a per standard basis so it is recommended to apply changes on records which are encoded using the same standard.  When applying changes, user privileges apply, so if the user cannot edit a selected record, batch edits will not be applied to that record.  This operations applies the `update-fixed-info.xsl` transformation for the metadata schema and  updates the change date if the parameter `updateDateStamp` is set to `true`.  ## Changes with GeoNetwork 4  * `diffType` not yet supported.  ``` 
     * Preview batch editing results.
     */
    async previewBatchEditRaw(requestParameters: PreviewBatchEditRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<string>> {
        if (requestParameters['batchEditParameter'] == null) {
            throw new runtime.RequiredError(
                'batchEditParameter',
                'Required parameter "batchEditParameter" was null or undefined when calling previewBatchEdit().'
            );
        }

        const queryParameters: any = {};

        if (requestParameters['uuids'] != null) {
            queryParameters['uuids'] = requestParameters['uuids'];
        }

        if (requestParameters['bucket'] != null) {
            queryParameters['bucket'] = requestParameters['bucket'];
        }

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        const response = await this.request({
            path: `/api/records/batchediting/preview`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: requestParameters['batchEditParameter']!.map(BatchEditParameterToJSON),
        }, initOverrides);

        if (this.isJsonMime(response.headers.get('content-type'))) {
            return new runtime.JSONApiResponse<string>(response);
        } else {
            return new runtime.TextApiResponse(response) as any;
        }
    }

    /**
     * Batch editing API allows to apply multiple edits to one or more record.  **Warning: You can break things here. When defining xpath and using delete or replace mode, be sure to test on a single record before applying changes to a lot of records. If needed, back up your record first and use the preview mode to check the processing.**  Changes are defined on a per standard basis so it is recommended to apply changes on records which are encoded using the same standard.  When applying changes, user privileges apply, so if the user cannot edit a selected record, batch edits will not be applied to that record.  This operations applies the `update-fixed-info.xsl` transformation for the metadata schema and  updates the change date if the parameter `updateDateStamp` is set to `true`.  ## Changes with GeoNetwork 4  * `diffType` not yet supported.  ``` 
     * Preview batch editing results.
     */
    async previewBatchEdit(requestParameters: PreviewBatchEditRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<string> {
        const response = await this.previewBatchEditRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Create a new resource for a given metadata
     */
    async putResourceRaw(requestParameters: PutResourceRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<MetadataResource>> {
        if (requestParameters['metadataUuid'] == null) {
            throw new runtime.RequiredError(
                'metadataUuid',
                'Required parameter "metadataUuid" was null or undefined when calling putResource().'
            );
        }

        if (requestParameters['file'] == null) {
            throw new runtime.RequiredError(
                'file',
                'Required parameter "file" was null or undefined when calling putResource().'
            );
        }

        const queryParameters: any = {};

        if (requestParameters['visibility'] != null) {
            queryParameters['visibility'] = requestParameters['visibility'];
        }

        if (requestParameters['approved'] != null) {
            queryParameters['approved'] = requestParameters['approved'];
        }

        const headerParameters: runtime.HTTPHeaders = {};

        const consumes: runtime.Consume[] = [
            { contentType: 'multipart/form-data' },
        ];
        // @ts-ignore: canConsumeForm may be unused
        const canConsumeForm = runtime.canConsumeForm(consumes);

        let formParams: { append(param: string, value: any): any };
        let useForm = false;
        // use FormData to transmit files using content-type "multipart/form-data"
        useForm = canConsumeForm;
        if (useForm) {
            formParams = new FormData();
        } else {
            formParams = new URLSearchParams();
        }

        if (requestParameters['file'] != null) {
            formParams.append('file', requestParameters['file'] as any);
        }

        const response = await this.request({
            path: `/api/records/{metadataUuid}/attachments`.replace(`{${"metadataUuid"}}`, encodeURIComponent(String(requestParameters['metadataUuid']))),
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: formParams,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => MetadataResourceFromJSON(jsonValue));
    }

    /**
     * Create a new resource for a given metadata
     */
    async putResource(requestParameters: PutResourceRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<MetadataResource> {
        const response = await this.putResourceRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Create a new resource from a URL for a given metadata
     */
    async putResourceFromURLRaw(requestParameters: PutResourceFromURLRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<MetadataResource>> {
        if (requestParameters['metadataUuid'] == null) {
            throw new runtime.RequiredError(
                'metadataUuid',
                'Required parameter "metadataUuid" was null or undefined when calling putResourceFromURL().'
            );
        }

        if (requestParameters['url'] == null) {
            throw new runtime.RequiredError(
                'url',
                'Required parameter "url" was null or undefined when calling putResourceFromURL().'
            );
        }

        const queryParameters: any = {};

        if (requestParameters['visibility'] != null) {
            queryParameters['visibility'] = requestParameters['visibility'];
        }

        if (requestParameters['url'] != null) {
            queryParameters['url'] = requestParameters['url'];
        }

        if (requestParameters['approved'] != null) {
            queryParameters['approved'] = requestParameters['approved'];
        }

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/api/records/{metadataUuid}/attachments`.replace(`{${"metadataUuid"}}`, encodeURIComponent(String(requestParameters['metadataUuid']))),
            method: 'PUT',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => MetadataResourceFromJSON(jsonValue));
    }

    /**
     * Create a new resource from a URL for a given metadata
     */
    async putResourceFromURL(requestParameters: PutResourceFromURLRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<MetadataResource> {
        const response = await this.putResourceFromURLRaw(requestParameters, initOverrides);
        return await response.value();
    }

}

/**
 * @export
 */
export const GetAllResourcesSortEnum = {
    Type: 'type',
    Name: 'name'
} as const;
export type GetAllResourcesSortEnum = typeof GetAllResourcesSortEnum[keyof typeof GetAllResourcesSortEnum];
/**
 * @export
 */
export const PatchResourceVisibilityEnum = {
    Public: 'public',
    Private: 'private'
} as const;
export type PatchResourceVisibilityEnum = typeof PatchResourceVisibilityEnum[keyof typeof PatchResourceVisibilityEnum];
/**
 * @export
 */
export const PutResourceVisibilityEnum = {
    Public: 'public',
    Private: 'private'
} as const;
export type PutResourceVisibilityEnum = typeof PutResourceVisibilityEnum[keyof typeof PutResourceVisibilityEnum];
/**
 * @export
 */
export const PutResourceFromURLVisibilityEnum = {
    Public: 'public',
    Private: 'private'
} as const;
export type PutResourceFromURLVisibilityEnum = typeof PutResourceFromURLVisibilityEnum[keyof typeof PutResourceFromURLVisibilityEnum];
