import { getErrorMessage } from "@/lib/error-handling"
import { getAreaChildren, getLocationsByTypeName } from "@/lib/location-database/location-db"
import { isParentType, LDbFeature, LdbFeatureTypeEnum, ZLdbFeatureTypeEnum } from "@/lib/location-database/location-db-types"
import { logErr, logInfo } from "@/lib/logging"
import { tool } from "ai"
import { z } from "zod"

interface LocationData {
    id: number,
    parentAreaId: number,
    type: LdbFeatureTypeEnum,
    name: string,
}

const ZLocationInformationRequest = z.object({
    showMap: z.boolean().default(false).describe("true se l'utente richiede la mappa"),
    locationType: ZLdbFeatureTypeEnum.describe("tipo della località scelta dall'utente"),
    locationName: z.string().describe("nome della località"),
})

const ZLocationInLocationRequest = z.object({
    showMap: z.boolean().default(false).describe("true se l'utente richiede la mappa"),
    parentLocationType: ZLdbFeatureTypeEnum.describe("tipo della località scelta dall'utente"),
    childLocationType: ZLdbFeatureTypeEnum.describe("tipo della località scelta dall'utente"),
    parentLocationName: z.string().describe("nome della località"),
})

const ZLocationDbRequest = z.object({
    locationType: ZLdbFeatureTypeEnum.describe("tipo della località scelta dall'utente"),
    locationCode: z.string().optional().describe("codice della località"),
    locationName: z.string().optional().describe("nome della località"),
    relatedLocationType: ZLdbFeatureTypeEnum.optional().describe("tipo delle località children"),
})

export interface LocationDbResponseType {
    errorMessage?: string
    showMap?: boolean
    locations?: LocationData[]
}

const areaInfoTool = tool({
    description: "fornisce informazioni su un'area (regione, provincia o città)",
    parameters: ZLocationInformationRequest.describe("i paremetri per la ricerca della località"),
    execute: async ({ showMap, locationType, locationName }): Promise<LocationDbResponseType> => {
        const TOOL_NAME = "areaInfoTool"
        logInfo(`${TOOL_NAME}: locationType: ${locationType} locationName: ${locationName}`)
        try {
            const data = getLocationsByTypeName(locationType, locationName)
            logInfo(`${TOOL_NAME}: returning ${data.length} locations`)
            const locations = data.map(mapLocationData)
            return { showMap, locations }
        } catch (error) {
            return { errorMessage: getErrorMessage(error) }
        }
    }
})

const areaChildrenTool = tool({
    description: "fornisce informazioni sulle aree (regione, provincia o città) contenute in un'altra area (regione, provincia o città)",
    parameters: ZLocationInLocationRequest.describe("i paremetri per la ricerca della località"),
    execute: async ({ showMap, parentLocationType, childLocationType, parentLocationName }): Promise<LocationDbResponseType> => {
        const TOOL_NAME = "areaChildrenTool"
        logInfo(`${TOOL_NAME}: parent type: ${parentLocationType} name: ${parentLocationName} child type: ${childLocationType}`)
        try {
            if (!isParentType(parentLocationType, childLocationType)) {
                const error = `Una ${childLocationType} non può essere contenuta in una ${parentLocationType}`
                logInfo(`${TOOL_NAME}: ${error}`)
                return { errorMessage: error }
            }
            const parentData = getLocationsByTypeName(parentLocationType, parentLocationName)
            if (parentData?.length === 0) {
                return { errorMessage: `Nessuna ${parentLocationType} trovata per ${parentLocationName}` }
            }
            const data = parentData.flatMap(p => getAreaChildren(p, childLocationType))
            logInfo(`${TOOL_NAME}: returning ${data.length} locations`)
            return { showMap, locations: data.map(mapLocationData) }
        } catch (error) {
            logErr(`${TOOL_NAME}: ${error}`)
            return { errorMessage: getErrorMessage(error) }
        }
    }
})

function mapLocationData(location: LDbFeature): LocationData {
    return {
        "id": location.properties.id,
        "parentAreaId": location.properties.parentAreaId,
        "type": location.properties.type,
        "name": location.properties.name,
    }
}

const allTools = {
    areaInfoTool,
    areaChildrenTool
}

export default allTools
