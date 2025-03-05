import { Geometry } from "geojson";
import * as turf from '@turf/turf';
import { getLocationsByTypeName } from "../location-database/location-db";
import { TopicArrayType, TrafficDataResponse } from "./traffic-database-types";
import { fetchTrafficDataBySlug } from "@/lib/traffic-database/luceverde-api";


export async function fetchTrafficInfoByFeatures(topics: TopicArrayType): Promise<TrafficDataResponse> {
    const mappedTopics = topics.flatMap(t => getLocationsByTypeName(t.locationType, t.locationName))
    const containingGeometries = mappedTopics.map(t => t.geometry)
    const trafficDataResponse  = await fetchTrafficDataBySlug("italia")
    if (trafficDataResponse.error) {
        return { error: trafficDataResponse.error }
    }
    if (trafficDataResponse.data?.features?.length) {
        const contanedFeatures = trafficDataResponse.data?.features.filter(f => containedInAny(containingGeometries, f.geometry))
        return { data: { type: "FeatureCollection", features: contanedFeatures } }
    } 
    return { }
}

function containedInAny(geometries: Geometry[], geometry: Geometry) {
    return geometries.some(g => turf.booleanContains(g, geometry))
}
