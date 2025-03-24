import { getErrorMessage } from "@/lib/error-handling"
import { getAreaChildren, getAreaIdHierarchy, getFeaturesById, getLocationsByTypeName } from "@/lib/location-database/location-db"
import { isParentType, LDbFeature, LdbFeatureTypeEnum, LDbRoadFeature, ZLdbFeatureTypeEnum } from "@/lib/location-database/location-db-types"
import { logErr, logInfo } from "@/lib/logging"
import { tool } from "ai"
import { z } from "zod"
import ALTERNATIVE_NAMES from "@/data/alternative-names.json"

interface LocationData {
    id: number,
    parentAreaId: number,
    parentAreaType?: LdbFeatureTypeEnum,
    parentAreaName?: string,
    genericType: LdbFeatureTypeEnum,
    type?: string,
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
    roadName: z.string().optional().describe("nome della strada richiesta"),
    areaType: ZLdbFeatureTypeEnum.optional().describe("tipo di area in cui cercare la strada"),
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
            const alternativeName = (ALTERNATIVE_NAMES as Record<string, string>)[locationName.toLowerCase()]
            const data = getLocationsByTypeName(locationType, undefined, alternativeName ?? locationName)
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
    parameters: ZLocationInLocationRequest.describe("i parametri per la ricerca della località"),
    execute: async ({ showMap, parentLocationType, childLocationType, parentLocationName }): Promise<LocationDbResponseType> => {
        const TOOL_NAME = "areaChildrenTool"
        logInfo(`${TOOL_NAME}: parent type: ${parentLocationType} name: ${parentLocationName} child type: ${childLocationType}`)
        try {
            if (!isParentType(parentLocationType, childLocationType)) {
                const error = `Una ${childLocationType} non può essere contenuta in una ${parentLocationType}`
                logInfo(`${TOOL_NAME}: ${error}`)
                return { errorMessage: error }
            }
            const alternativeName = (ALTERNATIVE_NAMES as Record<string, string>)[parentLocationName.toLowerCase()]
            const parentData = getLocationsByTypeName(parentLocationType, undefined, alternativeName ?? parentLocationName)
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
    execute: async ({ showMap, locationType, roadNumber, roadName, areaType, areaName }): Promise<LocationDbResponseType> => {
        const TOOL_NAME = "roadInfoTool:"
        try {
            logInfo(TOOL_NAME, "type:", locationType, "number:", roadNumber, "name:", roadName, "area type:", areaType, "area name:", areaName)
            let hierarchy = [] as number[]
            if (areaName) {
                const alternativeName = (ALTERNATIVE_NAMES as Record<string, string>)[areaName.toLowerCase()]
                const areas = getLocationsByTypeName(areaType ?? LdbFeatureTypeEnum.Province, undefined, alternativeName ?? areaName)
                if (areas.length === 0) {
                    return { errorMessage: `Nessuna ${areaType} trovata per "${areaName}"` }
                } else if (areas.length > 1) {
                    return { errorMessage: `Ci sono diverse ${areaType} con un nome simile a "${areaName}"` }
                }
                const area = areas[0]
                hierarchy = getAreaIdHierarchy(area.properties.id)
            }
            const roads = getLocationsByTypeName(locationType, roadNumber, roadName, hierarchy) as LDbRoadFeature[]
            
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
    const parentArea = location.properties.parentAreaId > 0 ?
        getFeaturesById([location.properties.parentAreaId])[0] : undefined
    return {
        "id": location.properties.id,
        "parentAreaId": location.properties.parentAreaId,
        "genericType": location.properties.type,
        "type": location.properties.tmcTypeDescription,
        "code": location.properties.areaCode,
        "name": location.properties.name,
        "parentAreaType": parentArea?.properties.type,
        "parentAreaName": parentArea?.properties.name
    }
}

function mapRoadData(location: LDbRoadFeature): LocationData {
    const parentArea = location.properties.parentAreaId > 0 ?
        getFeaturesById([location.properties.parentAreaId])[0] : undefined
    return {
        "id": location.properties.id,
        "code": location.properties.roadNumber,
        "parentAreaId": location.properties.parentAreaId,
        "genericType": location.properties.type,
        "type": location.properties.tmcTypeDescription,
        "name": location.properties.name,
        "parentAreaType": parentArea?.properties.type,
        "parentAreaName": parentArea?.properties.name
    }
}

const allTools = {
    areaInfoTool,
    areaChildrenTool,
    roadInfoTool,
    locationChooseTool
}

export default allTools
