import { getErrorMessage } from "@/lib/error-handling"
import { getAreaChildren, getLocationsByTypeName, getRoads } from "@/lib/location-database/location-db"
import { isParentType, LDbFeature, LdbFeatureTypeEnum, LDbRoadFeature, ZLdbFeatureTypeEnum } from "@/lib/location-database/location-db-types"
import { logErr, logInfo } from "@/lib/logging"
import { tool } from "ai"
import { z } from "zod"

interface LocationData {
    id: number,
    parentAreaId: number,
    type: LdbFeatureTypeEnum,
    code?: string,
    name: string,
}

const ZLocationData = z.object({
    id: z.number().describe("identificatore unico della località"),
    parentAreaId: z.number().describe("identificatore unico della area padre della località"),
    type: ZLdbFeatureTypeEnum.describe("tipo della località"),
    name: z.string().describe("nome della località"),
})

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
    locationCode: z.string().optional().describe("codice della strada extraurbana o dell'autostrada"),
    locationName: z.string().optional().describe("nome della località"),
    relatedLocationType: ZLdbFeatureTypeEnum.optional().describe("tipo delle località children"),
})

const ZRoadInformationRequest = z.object({
    showMap: z.boolean().default(false).describe("true se l'utente richiede la mappa"),
    locationType: ZLdbFeatureTypeEnum.describe("tipo della località scelta dall'utente"),
    roadNumber: z.string().optional().describe("numero della strada, esempio: A1, SS23, SR43"),
    roadName: z.string().optional().describe("nome della strada"),
    areaName: z.string().optional().describe("nome della città, provincia o regione dove si trova la strada"),
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
                .sort((a, b) => a.properties.name.localeCompare(b.properties.name))
            logInfo(`${TOOL_NAME}: returning ${data.length} locations`)
            return { showMap, locations: data.map(mapLocationData) }
        } catch (error) {
            logErr(`${TOOL_NAME}: ${error}`)
            return { errorMessage: getErrorMessage(error) }
        }
    }
})

const roadInfoTool = tool({
    description: "fornisce informazioni su una strada o un indirizzo",
    parameters: ZRoadInformationRequest.describe("i parametri per la ricerca della strada o dell'indirizzo"),
    execute: async ({ showMap, locationType, roadNumber, roadName, areaName }): Promise<LocationDbResponseType> => {
        const TOOL_NAME = "roadInfoTool:"
        try {
            logInfo(TOOL_NAME, "type:", locationType, "number:", roadNumber, "name:", roadName, "area:", areaName)
            const roads = getRoads(roadNumber, roadName, areaName)
            
            return { showMap, locations: roads.map(mapRoadData) }
        } catch (error) {
            logErr(`${TOOL_NAME}: ${error}`)
            return { errorMessage: getErrorMessage(error) }
        }
    }
})

const locationChooseTool = tool({
    description: "consente all'utente di scegliere una località",
    parameters: z.object({
        locations: z.array(ZLocationData).describe("elenco delle località tra cui scegliere")
    }).describe("i paremetri per la scelta della località")
})

function mapLocationData(location: LDbFeature): LocationData {
    return {
        "id": location.properties.id,
        "parentAreaId": location.properties.parentAreaId,
        "type": location.properties.type,
        "name": location.properties.name,
    }
}

function mapRoadData(location: LDbRoadFeature): LocationData {
    return {
        "id": location.properties.id,
        "code": location.properties.roadNumber,
        "parentAreaId": location.properties.parentAreaId,
        "type": location.properties.type,
        "name": location.properties.name,
    }
}

const allTools = {
    areaInfoTool,
    areaChildrenTool,
    roadInfoTool,
    locationChooseTool
}

export default allTools
