import { Feature, FeatureCollection, Geometry, LineString, MultiPoint, Position } from "geojson"
import { jsonDataFetch } from "@/lib/network"
import { TrafficEventType } from "@/lib/traffic-database/traffic-database-types"

export interface LvdEventProps {
    id: string
    priority: number,
    updateDate: string
    department: string,
    road: string
    event: {
        en: string,
        it: string
    },
    note: {
        en: string,
        it: string
    },
    translation: {
        en: string
        it: string
    }
    iconName: string
    source: string
}

export async function fetchTrafficDataBySlug(slug: string) {
    const URL = "https://api.luceverde.it/duel/its/vtl/srv/v1/geojson/iniziativa/event_data"
    const completeUrl = `${URL}/${slug}`
    const trafficDataResponse = await jsonDataFetch<FeatureCollection<Geometry, LvdEventProps>>(completeUrl)
    if (trafficDataResponse.error) {
        return { error: trafficDataResponse.error.message }
    }
    const newFeatures = trafficDataResponse?.data?.features.map(mapGeometry)
    return { data: { ...trafficDataResponse.data, features: newFeatures } }
}

function mapGeometry(feature: Feature<Geometry, LvdEventProps>): Feature<Geometry, TrafficEventType> {
    const geometry: Geometry = feature.geometry.type === "MultiPoint"
        ? {
            type: "LineString",
            coordinates: feature.geometry.coordinates as Position[]
        }
        : feature.geometry
    const properties = {
        id: feature.properties.id,
        priority: feature.properties.priority,
        updateDate: feature.properties.updateDate,
        source: feature.properties.source,
        road: feature.properties.road,
        description: feature.properties.event.it,
        note: feature.properties.note?.it,
    }
    return { type: "Feature", geometry, properties }
}
