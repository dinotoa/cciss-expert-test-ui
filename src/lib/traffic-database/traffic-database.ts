import { fetchTrafficDataBySlug } from "@/lib/traffic-database/luceverde-api";
import * as turf from '@turf/turf';
import { Geometry } from "geojson";
import { getLocationsByTypeName } from "../location-database/location-db";
import { TopicArrayType, TrafficDataResponse } from "./traffic-database-types";


export async function fetchTrafficInfoByFeatures(topics: TopicArrayType): Promise<TrafficDataResponse> {
    const mappedTopics = topics.flatMap(t => getLocationsByTypeName(t.locationType, t.locationName))
    const containingGeometries = mappedTopics.map(t => t.geometry)
    const trafficDataResponse = await fetchTrafficDataBySlug("italia")
    if (trafficDataResponse.error) {
        return { error: trafficDataResponse.error }
    }
    if (trafficDataResponse.data?.features?.length) {
        const contanedFeatures = trafficDataResponse.data?.features.filter(f => containedInAny(containingGeometries, f.geometry))
        return { data: { type: "FeatureCollection", features: contanedFeatures } }
    }
    return {}
}

function containedInAny(geometries: Geometry[], geometry: Geometry) {
    try {
        switch (geometry.type) {
            case "LineString":
                return geometries.some(g => turf.booleanIntersects(g, geometry))
            case "MultiPolygon":
            case "Polygon":
                return geometries.some(g => turf.booleanIntersects(geometry, g))
            case "Point":
                return geometries.some(g => ((g.type === "Polygon") || (g.type === "MultiPolygon")) && turf.booleanPointInPolygon(geometry, g))
        }

        return false && geometries.some(g => turf.booleanContains(g, geometry))
    } catch (e: any) {
        return false
    }
}
