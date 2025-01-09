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

import { mapValues } from '../runtime';
import type { GnSpecificationConformance } from './GnGnSpecificationConformance';
import {
    GnSpecificationConformanceFromJSON,
    GnSpecificationConformanceFromJSONTyped,
    GnSpecificationConformanceToJSON,
} from './GnGnSpecificationConformance';
import type { GnResourceIdentifier } from './GnGnResourceIdentifier';
import {
    GnResourceIdentifierFromJSON,
    GnResourceIdentifierFromJSONTyped,
    GnResourceIdentifierToJSON,
} from './GnGnResourceIdentifier';
import type { GnMaintenance } from './GnGnMaintenance';
import {
    GnMaintenanceFromJSON,
    GnMaintenanceFromJSONTyped,
    GnMaintenanceToJSON,
} from './GnGnMaintenance';
import type { GnResourceDate } from './GnGnResourceDate';
import {
    GnResourceDateFromJSON,
    GnResourceDateFromJSONTyped,
    GnResourceDateToJSON,
} from './GnGnResourceDate';
import type { GnDateRangeDetails } from './GnGnDateRangeDetails';
import {
    GnDateRangeDetailsFromJSON,
    GnDateRangeDetailsFromJSONTyped,
    GnDateRangeDetailsToJSON,
} from './GnGnDateRangeDetails';
import type { GnCrsDetails } from './GnGnCrsDetails';
import {
    GnCrsDetailsFromJSON,
    GnCrsDetailsFromJSONTyped,
    GnCrsDetailsToJSON,
} from './GnGnCrsDetails';
import type { GnDateRange } from './GnGnDateRange';
import {
    GnDateRangeFromJSON,
    GnDateRangeFromJSONTyped,
    GnDateRangeToJSON,
} from './GnGnDateRange';
import type { GnIndexingErrorMsg } from './GnGnIndexingErrorMsg';
import {
    GnIndexingErrorMsgFromJSON,
    GnIndexingErrorMsgFromJSONTyped,
    GnIndexingErrorMsgToJSON,
} from './GnGnIndexingErrorMsg';
import type { GnProcessStep } from './GnGnProcessStep';
import {
    GnProcessStepFromJSON,
    GnProcessStepFromJSONTyped,
    GnProcessStepToJSON,
} from './GnGnProcessStep';
import type { GnFeatureType } from './GnGnFeatureType';
import {
    GnFeatureTypeFromJSON,
    GnFeatureTypeFromJSONTyped,
    GnFeatureTypeToJSON,
} from './GnGnFeatureType';
import type { GnMeasure } from './GnGnMeasure';
import {
    GnMeasureFromJSON,
    GnMeasureFromJSONTyped,
    GnMeasureToJSON,
} from './GnGnMeasure';
import type { GnRecordLink } from './GnGnRecordLink';
import {
    GnRecordLinkFromJSON,
    GnRecordLinkFromJSONTyped,
    GnRecordLinkToJSON,
} from './GnGnRecordLink';
import type { GnThesaurus } from './GnGnThesaurus';
import {
    GnThesaurusFromJSON,
    GnThesaurusFromJSONTyped,
    GnThesaurusToJSON,
} from './GnGnThesaurus';
import type { GnOverview } from './GnGnOverview';
import {
    GnOverviewFromJSON,
    GnOverviewFromJSONTyped,
    GnOverviewToJSON,
} from './GnGnOverview';
import type { GnLink } from './GnGnLink';
import {
    GnLinkFromJSON,
    GnLinkFromJSONTyped,
    GnLinkToJSON,
} from './GnGnLink';
import type { GnVerticalRange } from './GnGnVerticalRange';
import {
    GnVerticalRangeFromJSON,
    GnVerticalRangeFromJSONTyped,
    GnVerticalRangeToJSON,
} from './GnGnVerticalRange';

/**
 * 
 * @export
 * @interface GnIndexRecord
 */
export interface GnIndexRecord {
    /**
     * 
     * @type {string}
     * @memberof GnIndexRecord
     */
    docType?: GnIndexRecordDocTypeEnum;
    /**
     * 
     * @type {string}
     * @memberof GnIndexRecord
     */
    document?: string;
    /**
     * 
     * @type {string}
     * @memberof GnIndexRecord
     */
    metadataIdentifier?: string;
    /**
     * 
     * @type {{ [key: string]: string; }}
     * @memberof GnIndexRecord
     */
    standardNameObject?: { [key: string]: string; };
    /**
     * 
     * @type {{ [key: string]: string; }}
     * @memberof GnIndexRecord
     */
    standardVersionObject?: { [key: string]: string; };
    /**
     * 
     * @type {string}
     * @memberof GnIndexRecord
     */
    indexingDate?: string;
    /**
     * 
     * @type {string}
     * @memberof GnIndexRecord
     */
    dateStamp?: string;
    /**
     * 
     * @type {string}
     * @memberof GnIndexRecord
     */
    mainLanguage?: string;
    /**
     * 
     * @type {Array<string>}
     * @memberof GnIndexRecord
     */
    resourceType?: Array<string>;
    /**
     * 
     * @type {{ [key: string]: string; }}
     * @memberof GnIndexRecord
     */
    resourceTypeNameObject?: { [key: string]: string; };
    /**
     * 
     * @type {{ [key: string]: string; }}
     * @memberof GnIndexRecord
     */
    resourceTitleObject?: { [key: string]: string; };
    /**
     * 
     * @type {Array<{ [key: string]: string; }>}
     * @memberof GnIndexRecord
     */
    resourceAltTitleObject?: Array<{ [key: string]: string; }>;
    /**
     * 
     * @type {Array<GnResourceDate>}
     * @memberof GnIndexRecord
     */
    resourceDate?: Array<GnResourceDate>;
    /**
     * 
     * @type {Array<GnDateRange>}
     * @memberof GnIndexRecord
     */
    resourceTemporalDateRange?: Array<GnDateRange>;
    /**
     * 
     * @type {Array<GnResourceIdentifier>}
     * @memberof GnIndexRecord
     */
    resourceIdentifier?: Array<GnResourceIdentifier>;
    /**
     * 
     * @type {{ [key: string]: string; }}
     * @memberof GnIndexRecord
     */
    resourceAbstractObject?: { [key: string]: string; };
    /**
     * 
     * @type {Array<{ [key: string]: string; }>}
     * @memberof GnIndexRecord
     */
    supplementalInformationObject?: Array<{ [key: string]: string; }>;
    /**
     * 
     * @type {Array<{ [key: string]: string; }>}
     * @memberof GnIndexRecord
     */
    purposeObject?: Array<{ [key: string]: string; }>;
    /**
     * 
     * @type {Array<{ [key: string]: string; }>}
     * @memberof GnIndexRecord
     */
    tag?: Array<{ [key: string]: string; }>;
    /**
     * 
     * @type {boolean}
     * @memberof GnIndexRecord
     */
    isOpenData?: boolean;
    /**
     * 
     * @type {{ [key: string]: GnThesaurus; }}
     * @memberof GnIndexRecord
     */
    allKeywords?: { [key: string]: GnThesaurus; };
    /**
     * 
     * @type {Array<string>}
     * @memberof GnIndexRecord
     */
    resolutionDistance?: Array<string>;
    /**
     * 
     * @type {Array<number>}
     * @memberof GnIndexRecord
     */
    resolutionScaleDenominator?: Array<number>;
    /**
     * 
     * @type {Array<{ [key: string]: string; }>}
     * @memberof GnIndexRecord
     */
    extentIdentifierObject?: Array<{ [key: string]: string; }>;
    /**
     * 
     * @type {Array<{ [key: string]: string; }>}
     * @memberof GnIndexRecord
     */
    extentDescriptionObject?: Array<{ [key: string]: string; }>;
    /**
     * 
     * @type {Array<string>}
     * @memberof GnIndexRecord
     */
    shape?: Array<string>;
    /**
     * 
     * @type {Array<string>}
     * @memberof GnIndexRecord
     */
    shapeParsingError?: Array<string>;
    /**
     * 
     * @type {Array<string>}
     * @memberof GnIndexRecord
     */
    geom?: Array<string>;
    /**
     * 
     * @type {Array<string>}
     * @memberof GnIndexRecord
     */
    location?: Array<string>;
    /**
     * 
     * @type {Array<GnDateRange>}
     * @memberof GnIndexRecord
     */
    resourceTemporalExtentDateRange?: Array<GnDateRange>;
    /**
     * 
     * @type {Array<GnDateRangeDetails>}
     * @memberof GnIndexRecord
     */
    resourceTemporalExtentDetails?: Array<GnDateRangeDetails>;
    /**
     * 
     * @type {Array<GnVerticalRange>}
     * @memberof GnIndexRecord
     */
    resourceVerticalRange?: Array<GnVerticalRange>;
    /**
     * 
     * @type {Array<string>}
     * @memberof GnIndexRecord
     */
    coordinateSystem?: Array<string>;
    /**
     * 
     * @type {Array<GnCrsDetails>}
     * @memberof GnIndexRecord
     */
    crsDetails?: Array<GnCrsDetails>;
    /**
     * 
     * @type {Array<GnFeatureType>}
     * @memberof GnIndexRecord
     */
    featureTypes?: Array<GnFeatureType>;
    /**
     * 
     * @type {Array<GnLink>}
     * @memberof GnIndexRecord
     */
    link?: Array<GnLink>;
    /**
     * 
     * @type {Array<{ [key: string]: string; }>}
     * @memberof GnIndexRecord
     */
    lineageObject?: Array<{ [key: string]: string; }>;
    /**
     * 
     * @type {Array<string>}
     * @memberof GnIndexRecord
     */
    hassource?: Array<string>;
    /**
     * 
     * @type {Array<GnRecordLink>}
     * @memberof GnIndexRecord
     */
    recordLink?: Array<GnRecordLink>;
    /**
     * 
     * @type {Array<{ [key: string]: string; }>}
     * @memberof GnIndexRecord
     */
    sourceDescriptionObject?: Array<{ [key: string]: string; }>;
    /**
     * 
     * @type {Array<GnProcessStep>}
     * @memberof GnIndexRecord
     */
    processSteps?: Array<GnProcessStep>;
    /**
     * 
     * @type {Array<GnMeasure>}
     * @memberof GnIndexRecord
     */
    measure?: Array<GnMeasure>;
    /**
     * 
     * @type {Array<string>}
     * @memberof GnIndexRecord
     */
    format?: Array<string>;
    /**
     * 
     * @type {Array<{ [key: string]: string; }>}
     * @memberof GnIndexRecord
     */
    orderingInstructionsObject?: Array<{ [key: string]: string; }>;
    /**
     * 
     * @type {Array<string>}
     * @memberof GnIndexRecord
     */
    recordGroup?: Array<string>;
    /**
     * 
     * @type {Array<string>}
     * @memberof GnIndexRecord
     */
    parentUuid?: Array<string>;
    /**
     * 
     * @type {string}
     * @memberof GnIndexRecord
     */
    recordOwner?: string;
    /**
     * 
     * @type {string}
     * @memberof GnIndexRecord
     */
    uuid?: string;
    /**
     * 
     * @type {string}
     * @memberof GnIndexRecord
     */
    harvesterUuid?: string;
    /**
     * 
     * @type {Array<number>}
     * @memberof GnIndexRecord
     */
    groupPublishedId?: Array<number>;
    /**
     * 
     * @type {number}
     * @memberof GnIndexRecord
     */
    popularity?: number;
    /**
     * 
     * @type {string}
     * @memberof GnIndexRecord
     */
    userinfo?: string;
    /**
     * 
     * @type {boolean}
     * @memberof GnIndexRecord
     */
    isPublishedToAll?: boolean;
    /**
     * 
     * @type {string}
     * @memberof GnIndexRecord
     */
    draft?: string;
    /**
     * 
     * @type {string}
     * @memberof GnIndexRecord
     */
    changeDate?: string;
    /**
     * 
     * @type {number}
     * @memberof GnIndexRecord
     */
    id?: number;
    /**
     * 
     * @type {string}
     * @memberof GnIndexRecord
     */
    createDate?: string;
    /**
     * 
     * @type {boolean}
     * @memberof GnIndexRecord
     */
    isPublishedToIntranet?: boolean;
    /**
     * 
     * @type {number}
     * @memberof GnIndexRecord
     */
    valid?: number;
    /**
     * 
     * @type {string}
     * @memberof GnIndexRecord
     */
    isTemplate?: string;
    /**
     * 
     * @type {number}
     * @memberof GnIndexRecord
     */
    feedbackCount?: number;
    /**
     * 
     * @type {number}
     * @memberof GnIndexRecord
     */
    rating?: number;
    /**
     * 
     * @type {boolean}
     * @memberof GnIndexRecord
     */
    isHarvested?: boolean;
    /**
     * 
     * @type {number}
     * @memberof GnIndexRecord
     */
    userSavedCount?: number;
    /**
     * 
     * @type {string}
     * @memberof GnIndexRecord
     */
    sourceCatalogue?: string;
    /**
     * 
     * @type {Array<GnOverview>}
     * @memberof GnIndexRecord
     */
    overview?: Array<GnOverview>;
    /**
     * 
     * @type {string}
     * @memberof GnIndexRecord
     */
    documentStandard?: string;
    /**
     * 
     * @type {string}
     * @memberof GnIndexRecord
     */
    root?: string;
    /**
     * 
     * @type {Array<GnIndexingErrorMsg>}
     * @memberof GnIndexRecord
     */
    indexingErrorMsg?: Array<GnIndexingErrorMsg>;
    /**
     * 
     * @type {number}
     * @memberof GnIndexRecord
     */
    owner?: number;
    /**
     * 
     * @type {number}
     * @memberof GnIndexRecord
     */
    groupOwner?: number;
    /**
     * 
     * @type {string}
     * @memberof GnIndexRecord
     */
    logo?: string;
    /**
     * 
     * @type {Array<string>}
     * @memberof GnIndexRecord
     */
    otherLanguage?: Array<string>;
    /**
     * 
     * @type {Array<string>}
     * @memberof GnIndexRecord
     */
    otherLanguageId?: Array<string>;
    /**
     * 
     * @type {string}
     * @memberof GnIndexRecord
     */
    resourceEdition?: string;
    /**
     * 
     * @type {number}
     * @memberof GnIndexRecord
     */
    displayOrder?: number;
    /**
     * 
     * @type {Array<{ [key: string]: string; }>}
     * @memberof GnIndexRecord
     */
    licenseObject?: Array<{ [key: string]: string; }>;
    /**
     * 
     * @type {Array<GnMaintenance>}
     * @memberof GnIndexRecord
     */
    maintenance?: Array<GnMaintenance>;
    /**
     * 
     * @type {Array<{ [key: string]: string; }>}
     * @memberof GnIndexRecord
     */
    resourceCreditObject?: Array<{ [key: string]: string; }>;
    /**
     * 
     * @type {Array<string>}
     * @memberof GnIndexRecord
     */
    cat?: Array<string>;
    /**
     * 
     * @type {number}
     * @memberof GnIndexRecord
     */
    tagNumber?: number;
    /**
     * 
     * @type {string}
     * @memberof GnIndexRecord
     */
    mdStatus?: string;
    /**
     * 
     * @type {boolean}
     * @memberof GnIndexRecord
     */
    isPublishedToGuest?: boolean;
    /**
     * 
     * @type {Array<string>}
     * @memberof GnIndexRecord
     */
    groupPublished?: Array<string>;
    /**
     * 
     * @type {boolean}
     * @memberof GnIndexRecord
     */
    hasxlinks?: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof GnIndexRecord
     */
    inspireConformResource?: boolean;
    /**
     * 
     * @type {number}
     * @memberof GnIndexRecord
     */
    validInspire?: number;
    /**
     * 
     * @type {string}
     * @memberof GnIndexRecord
     */
    inspireReportUrl?: string;
    /**
     * 
     * @type {string}
     * @memberof GnIndexRecord
     */
    inspireValidationDate?: string;
    /**
     * 
     * @type {Array<string>}
     * @memberof GnIndexRecord
     */
    resourceLanguage?: Array<string>;
    /**
     * 
     * @type {Array<{ [key: string]: string; }>}
     * @memberof GnIndexRecord
     */
    orgObject?: Array<{ [key: string]: string; }>;
    /**
     * 
     * @type {Array<string>}
     * @memberof GnIndexRecord
     */
    recordOperateOn?: Array<string>;
    /**
     * 
     * @type {Array<string>}
     * @memberof GnIndexRecord
     */
    aggAssociated?: Array<string>;
    /**
     * 
     * @type {Array<string>}
     * @memberof GnIndexRecord
     */
    childUuid?: Array<string>;
    /**
     * 
     * @type {Array<string>}
     * @memberof GnIndexRecord
     */
    linkUrl?: Array<string>;
    /**
     * 
     * @type {Set<string>}
     * @memberof GnIndexRecord
     */
    linkProtocol?: Set<string>;
    /**
     * 
     * @type {Array<string>}
     * @memberof GnIndexRecord
     */
    serviceType?: Array<string>;
    /**
     * 
     * @type {Array<string>}
     * @memberof GnIndexRecord
     */
    serviceTypeVersion?: Array<string>;
    /**
     * 
     * @type {Array<GnSpecificationConformance>}
     * @memberof GnIndexRecord
     */
    specificationConformance?: Array<GnSpecificationConformance>;
    /**
     * 
     * @type {Array<string>}
     * @memberof GnIndexRecord
     */
    hasfeaturecat?: Array<string>;
}


/**
 * @export
 */
export const GnIndexRecordDocTypeEnum = {
    Metadata: 'metadata',
    Features: 'features'
} as const;
export type GnIndexRecordDocTypeEnum = typeof GnIndexRecordDocTypeEnum[keyof typeof GnIndexRecordDocTypeEnum];


/**
 * Check if a given object implements the GnIndexRecord interface.
 */
export function instanceOfGnIndexRecord(value: object): value is GnIndexRecord {
    return true;
}

export function GnIndexRecordFromJSON(json: any): GnIndexRecord {
    return GnIndexRecordFromJSONTyped(json, false);
}

export function GnIndexRecordFromJSONTyped(json: any, ignoreDiscriminator: boolean): GnIndexRecord {
    if (json == null) {
        return json;
    }
    return {
        
        'docType': json['docType'] == null ? undefined : json['docType'],
        'document': json['document'] == null ? undefined : json['document'],
        'metadataIdentifier': json['metadataIdentifier'] == null ? undefined : json['metadataIdentifier'],
        'standardNameObject': json['standardNameObject'] == null ? undefined : json['standardNameObject'],
        'standardVersionObject': json['standardVersionObject'] == null ? undefined : json['standardVersionObject'],
        'indexingDate': json['indexingDate'] == null ? undefined : json['indexingDate'],
        'dateStamp': json['dateStamp'] == null ? undefined : json['dateStamp'],
        'mainLanguage': json['mainLanguage'] == null ? undefined : json['mainLanguage'],
        'resourceType': json['resourceType'] == null ? undefined : json['resourceType'],
        'resourceTypeNameObject': json['resourceTypeNameObject'] == null ? undefined : json['resourceTypeNameObject'],
        'resourceTitleObject': json['resourceTitleObject'] == null ? undefined : json['resourceTitleObject'],
        'resourceAltTitleObject': json['resourceAltTitleObject'] == null ? undefined : json['resourceAltTitleObject'],
        'resourceDate': json['resourceDate'] == null ? undefined : ((json['resourceDate'] as Array<any>).map(GnResourceDateFromJSON)),
        'resourceTemporalDateRange': json['resourceTemporalDateRange'] == null ? undefined : ((json['resourceTemporalDateRange'] as Array<any>).map(GnDateRangeFromJSON)),
        'resourceIdentifier': json['resourceIdentifier'] == null ? undefined : ((json['resourceIdentifier'] as Array<any>).map(GnResourceIdentifierFromJSON)),
        'resourceAbstractObject': json['resourceAbstractObject'] == null ? undefined : json['resourceAbstractObject'],
        'supplementalInformationObject': json['supplementalInformationObject'] == null ? undefined : json['supplementalInformationObject'],
        'purposeObject': json['purposeObject'] == null ? undefined : json['purposeObject'],
        'tag': json['tag'] == null ? undefined : json['tag'],
        'isOpenData': json['isOpenData'] == null ? undefined : json['isOpenData'],
        'allKeywords': json['allKeywords'] == null ? undefined : (mapValues(json['allKeywords'], GnThesaurusFromJSON)),
        'resolutionDistance': json['resolutionDistance'] == null ? undefined : json['resolutionDistance'],
        'resolutionScaleDenominator': json['resolutionScaleDenominator'] == null ? undefined : json['resolutionScaleDenominator'],
        'extentIdentifierObject': json['extentIdentifierObject'] == null ? undefined : json['extentIdentifierObject'],
        'extentDescriptionObject': json['extentDescriptionObject'] == null ? undefined : json['extentDescriptionObject'],
        'shape': json['shape'] == null ? undefined : json['shape'],
        'shapeParsingError': json['shapeParsingError'] == null ? undefined : json['shapeParsingError'],
        'geom': json['geom'] == null ? undefined : json['geom'],
        'location': json['location'] == null ? undefined : json['location'],
        'resourceTemporalExtentDateRange': json['resourceTemporalExtentDateRange'] == null ? undefined : ((json['resourceTemporalExtentDateRange'] as Array<any>).map(GnDateRangeFromJSON)),
        'resourceTemporalExtentDetails': json['resourceTemporalExtentDetails'] == null ? undefined : ((json['resourceTemporalExtentDetails'] as Array<any>).map(GnDateRangeDetailsFromJSON)),
        'resourceVerticalRange': json['resourceVerticalRange'] == null ? undefined : ((json['resourceVerticalRange'] as Array<any>).map(GnVerticalRangeFromJSON)),
        'coordinateSystem': json['coordinateSystem'] == null ? undefined : json['coordinateSystem'],
        'crsDetails': json['crsDetails'] == null ? undefined : ((json['crsDetails'] as Array<any>).map(GnCrsDetailsFromJSON)),
        'featureTypes': json['featureTypes'] == null ? undefined : ((json['featureTypes'] as Array<any>).map(GnFeatureTypeFromJSON)),
        'link': json['link'] == null ? undefined : ((json['link'] as Array<any>).map(GnLinkFromJSON)),
        'lineageObject': json['lineageObject'] == null ? undefined : json['lineageObject'],
        'hassource': json['hassource'] == null ? undefined : json['hassource'],
        'recordLink': json['recordLink'] == null ? undefined : ((json['recordLink'] as Array<any>).map(GnRecordLinkFromJSON)),
        'sourceDescriptionObject': json['sourceDescriptionObject'] == null ? undefined : json['sourceDescriptionObject'],
        'processSteps': json['processSteps'] == null ? undefined : ((json['processSteps'] as Array<any>).map(GnProcessStepFromJSON)),
        'measure': json['measure'] == null ? undefined : ((json['measure'] as Array<any>).map(GnMeasureFromJSON)),
        'format': json['format'] == null ? undefined : json['format'],
        'orderingInstructionsObject': json['orderingInstructionsObject'] == null ? undefined : json['orderingInstructionsObject'],
        'recordGroup': json['recordGroup'] == null ? undefined : json['recordGroup'],
        'parentUuid': json['parentUuid'] == null ? undefined : json['parentUuid'],
        'recordOwner': json['recordOwner'] == null ? undefined : json['recordOwner'],
        'uuid': json['uuid'] == null ? undefined : json['uuid'],
        'harvesterUuid': json['harvesterUuid'] == null ? undefined : json['harvesterUuid'],
        'groupPublishedId': json['groupPublishedId'] == null ? undefined : json['groupPublishedId'],
        'popularity': json['popularity'] == null ? undefined : json['popularity'],
        'userinfo': json['userinfo'] == null ? undefined : json['userinfo'],
        'isPublishedToAll': json['isPublishedToAll'] == null ? undefined : json['isPublishedToAll'],
        'draft': json['draft'] == null ? undefined : json['draft'],
        'changeDate': json['changeDate'] == null ? undefined : json['changeDate'],
        'id': json['id'] == null ? undefined : json['id'],
        'createDate': json['createDate'] == null ? undefined : json['createDate'],
        'isPublishedToIntranet': json['isPublishedToIntranet'] == null ? undefined : json['isPublishedToIntranet'],
        'valid': json['valid'] == null ? undefined : json['valid'],
        'isTemplate': json['isTemplate'] == null ? undefined : json['isTemplate'],
        'feedbackCount': json['feedbackCount'] == null ? undefined : json['feedbackCount'],
        'rating': json['rating'] == null ? undefined : json['rating'],
        'isHarvested': json['isHarvested'] == null ? undefined : json['isHarvested'],
        'userSavedCount': json['userSavedCount'] == null ? undefined : json['userSavedCount'],
        'sourceCatalogue': json['sourceCatalogue'] == null ? undefined : json['sourceCatalogue'],
        'overview': json['overview'] == null ? undefined : ((json['overview'] as Array<any>).map(GnOverviewFromJSON)),
        'documentStandard': json['documentStandard'] == null ? undefined : json['documentStandard'],
        'root': json['root'] == null ? undefined : json['root'],
        'indexingErrorMsg': json['indexingErrorMsg'] == null ? undefined : ((json['indexingErrorMsg'] as Array<any>).map(GnIndexingErrorMsgFromJSON)),
        'owner': json['owner'] == null ? undefined : json['owner'],
        'groupOwner': json['groupOwner'] == null ? undefined : json['groupOwner'],
        'logo': json['logo'] == null ? undefined : json['logo'],
        'otherLanguage': json['otherLanguage'] == null ? undefined : json['otherLanguage'],
        'otherLanguageId': json['otherLanguageId'] == null ? undefined : json['otherLanguageId'],
        'resourceEdition': json['resourceEdition'] == null ? undefined : json['resourceEdition'],
        'displayOrder': json['displayOrder'] == null ? undefined : json['displayOrder'],
        'licenseObject': json['licenseObject'] == null ? undefined : json['licenseObject'],
        'maintenance': json['maintenance'] == null ? undefined : ((json['maintenance'] as Array<any>).map(GnMaintenanceFromJSON)),
        'resourceCreditObject': json['resourceCreditObject'] == null ? undefined : json['resourceCreditObject'],
        'cat': json['cat'] == null ? undefined : json['cat'],
        'tagNumber': json['tagNumber'] == null ? undefined : json['tagNumber'],
        'mdStatus': json['mdStatus'] == null ? undefined : json['mdStatus'],
        'isPublishedToGuest': json['isPublishedToGuest'] == null ? undefined : json['isPublishedToGuest'],
        'groupPublished': json['groupPublished'] == null ? undefined : json['groupPublished'],
        'hasxlinks': json['hasxlinks'] == null ? undefined : json['hasxlinks'],
        'inspireConformResource': json['inspireConformResource'] == null ? undefined : json['inspireConformResource'],
        'validInspire': json['valid_inspire'] == null ? undefined : json['valid_inspire'],
        'inspireReportUrl': json['inspireReportUrl'] == null ? undefined : json['inspireReportUrl'],
        'inspireValidationDate': json['inspireValidationDate'] == null ? undefined : json['inspireValidationDate'],
        'resourceLanguage': json['resourceLanguage'] == null ? undefined : json['resourceLanguage'],
        'orgObject': json['OrgObject'] == null ? undefined : json['OrgObject'],
        'recordOperateOn': json['recordOperateOn'] == null ? undefined : json['recordOperateOn'],
        'aggAssociated': json['agg_associated'] == null ? undefined : json['agg_associated'],
        'childUuid': json['childUuid'] == null ? undefined : json['childUuid'],
        'linkUrl': json['linkUrl'] == null ? undefined : json['linkUrl'],
        'linkProtocol': json['linkProtocol'] == null ? undefined : json['linkProtocol'],
        'serviceType': json['serviceType'] == null ? undefined : json['serviceType'],
        'serviceTypeVersion': json['serviceTypeVersion'] == null ? undefined : json['serviceTypeVersion'],
        'specificationConformance': json['specificationConformance'] == null ? undefined : ((json['specificationConformance'] as Array<any>).map(GnSpecificationConformanceFromJSON)),
        'hasfeaturecat': json['hasfeaturecat'] == null ? undefined : json['hasfeaturecat'],
    };
}

export function GnIndexRecordToJSON(value?: GnIndexRecord | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'docType': value['docType'],
        'document': value['document'],
        'metadataIdentifier': value['metadataIdentifier'],
        'standardNameObject': value['standardNameObject'],
        'standardVersionObject': value['standardVersionObject'],
        'indexingDate': value['indexingDate'],
        'dateStamp': value['dateStamp'],
        'mainLanguage': value['mainLanguage'],
        'resourceType': value['resourceType'],
        'resourceTypeNameObject': value['resourceTypeNameObject'],
        'resourceTitleObject': value['resourceTitleObject'],
        'resourceAltTitleObject': value['resourceAltTitleObject'],
        'resourceDate': value['resourceDate'] == null ? undefined : ((value['resourceDate'] as Array<any>).map(GnResourceDateToJSON)),
        'resourceTemporalDateRange': value['resourceTemporalDateRange'] == null ? undefined : ((value['resourceTemporalDateRange'] as Array<any>).map(GnDateRangeToJSON)),
        'resourceIdentifier': value['resourceIdentifier'] == null ? undefined : ((value['resourceIdentifier'] as Array<any>).map(GnResourceIdentifierToJSON)),
        'resourceAbstractObject': value['resourceAbstractObject'],
        'supplementalInformationObject': value['supplementalInformationObject'],
        'purposeObject': value['purposeObject'],
        'tag': value['tag'],
        'isOpenData': value['isOpenData'],
        'allKeywords': value['allKeywords'] == null ? undefined : (mapValues(value['allKeywords'], GnThesaurusToJSON)),
        'resolutionDistance': value['resolutionDistance'],
        'resolutionScaleDenominator': value['resolutionScaleDenominator'],
        'extentIdentifierObject': value['extentIdentifierObject'],
        'extentDescriptionObject': value['extentDescriptionObject'],
        'shape': value['shape'],
        'shapeParsingError': value['shapeParsingError'],
        'geom': value['geom'],
        'location': value['location'],
        'resourceTemporalExtentDateRange': value['resourceTemporalExtentDateRange'] == null ? undefined : ((value['resourceTemporalExtentDateRange'] as Array<any>).map(GnDateRangeToJSON)),
        'resourceTemporalExtentDetails': value['resourceTemporalExtentDetails'] == null ? undefined : ((value['resourceTemporalExtentDetails'] as Array<any>).map(GnDateRangeDetailsToJSON)),
        'resourceVerticalRange': value['resourceVerticalRange'] == null ? undefined : ((value['resourceVerticalRange'] as Array<any>).map(GnVerticalRangeToJSON)),
        'coordinateSystem': value['coordinateSystem'],
        'crsDetails': value['crsDetails'] == null ? undefined : ((value['crsDetails'] as Array<any>).map(GnCrsDetailsToJSON)),
        'featureTypes': value['featureTypes'] == null ? undefined : ((value['featureTypes'] as Array<any>).map(GnFeatureTypeToJSON)),
        'link': value['link'] == null ? undefined : ((value['link'] as Array<any>).map(GnLinkToJSON)),
        'lineageObject': value['lineageObject'],
        'hassource': value['hassource'],
        'recordLink': value['recordLink'] == null ? undefined : ((value['recordLink'] as Array<any>).map(GnRecordLinkToJSON)),
        'sourceDescriptionObject': value['sourceDescriptionObject'],
        'processSteps': value['processSteps'] == null ? undefined : ((value['processSteps'] as Array<any>).map(GnProcessStepToJSON)),
        'measure': value['measure'] == null ? undefined : ((value['measure'] as Array<any>).map(GnMeasureToJSON)),
        'format': value['format'],
        'orderingInstructionsObject': value['orderingInstructionsObject'],
        'recordGroup': value['recordGroup'],
        'parentUuid': value['parentUuid'],
        'recordOwner': value['recordOwner'],
        'uuid': value['uuid'],
        'harvesterUuid': value['harvesterUuid'],
        'groupPublishedId': value['groupPublishedId'],
        'popularity': value['popularity'],
        'userinfo': value['userinfo'],
        'isPublishedToAll': value['isPublishedToAll'],
        'draft': value['draft'],
        'changeDate': value['changeDate'],
        'id': value['id'],
        'createDate': value['createDate'],
        'isPublishedToIntranet': value['isPublishedToIntranet'],
        'valid': value['valid'],
        'isTemplate': value['isTemplate'],
        'feedbackCount': value['feedbackCount'],
        'rating': value['rating'],
        'isHarvested': value['isHarvested'],
        'userSavedCount': value['userSavedCount'],
        'sourceCatalogue': value['sourceCatalogue'],
        'overview': value['overview'] == null ? undefined : ((value['overview'] as Array<any>).map(GnOverviewToJSON)),
        'documentStandard': value['documentStandard'],
        'root': value['root'],
        'indexingErrorMsg': value['indexingErrorMsg'] == null ? undefined : ((value['indexingErrorMsg'] as Array<any>).map(GnIndexingErrorMsgToJSON)),
        'owner': value['owner'],
        'groupOwner': value['groupOwner'],
        'logo': value['logo'],
        'otherLanguage': value['otherLanguage'],
        'otherLanguageId': value['otherLanguageId'],
        'resourceEdition': value['resourceEdition'],
        'displayOrder': value['displayOrder'],
        'licenseObject': value['licenseObject'],
        'maintenance': value['maintenance'] == null ? undefined : ((value['maintenance'] as Array<any>).map(GnMaintenanceToJSON)),
        'resourceCreditObject': value['resourceCreditObject'],
        'cat': value['cat'],
        'tagNumber': value['tagNumber'],
        'mdStatus': value['mdStatus'],
        'isPublishedToGuest': value['isPublishedToGuest'],
        'groupPublished': value['groupPublished'],
        'hasxlinks': value['hasxlinks'],
        'inspireConformResource': value['inspireConformResource'],
        'valid_inspire': value['validInspire'],
        'inspireReportUrl': value['inspireReportUrl'],
        'inspireValidationDate': value['inspireValidationDate'],
        'resourceLanguage': value['resourceLanguage'],
        'OrgObject': value['orgObject'],
        'recordOperateOn': value['recordOperateOn'],
        'agg_associated': value['aggAssociated'],
        'childUuid': value['childUuid'],
        'linkUrl': value['linkUrl'],
        'linkProtocol': value['linkProtocol'] == null ? undefined : Array.from(value['linkProtocol'] as Set<any>),
        'serviceType': value['serviceType'],
        'serviceTypeVersion': value['serviceTypeVersion'],
        'specificationConformance': value['specificationConformance'] == null ? undefined : ((value['specificationConformance'] as Array<any>).map(GnSpecificationConformanceToJSON)),
        'hasfeaturecat': value['hasfeaturecat'],
    };
}

