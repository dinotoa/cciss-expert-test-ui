import { FeatureCollection, Geometry } from "geojson"
import { regionData, provinceData, cityData } from "./location-db-data"
import { LDbFeatureProps, LDbAreaFeature, ZLocationEnum, LocationDataType } from "./location-db-types"
import { z } from "zod"

const LDbRegions = (regionData as unknown as FeatureCollection<Geometry, LDbFeatureProps>).features.reduce(reduceAreaFeatures, {}) 
const LDbProvinces = (provinceData as unknown as FeatureCollection<Geometry, LDbFeatureProps>).features.reduce(reduceAreaFeatures, {}) 
const LDbCities = (cityData as unknown as FeatureCollection<Geometry, LDbFeatureProps>).features.reduce(reduceAreaFeatures, {}) 

function reduceAreaFeatures(acc: { [id: number]: LDbAreaFeature }, feat: LDbAreaFeature) {
    acc[feat.properties.id] = feat
    return acc
}

export function getLocationsByTypeName(type: z.infer<typeof ZLocationEnum>, name: string): LocationDataType[] {
  switch (type) {
    case "regione":
      return getRegionsByName(name)
    case "provincia":
      return getProvincesByName(name)
    case "città":
      return getCitiesByName(name)
    default:
      return []
  }
}

export function getRegionsByName(name: string): LDbAreaFeature[] {
  return Object.values(LDbRegions).filter(f => f.properties.name.toLowerCase() === name.toLowerCase())
}

export function getProvincesByName(name: string): LDbAreaFeature[] {
  return Object.values(LDbProvinces).filter(f => f.properties.name.toLowerCase() === name.toLowerCase())
}

export function getCitiesByName(name: string): LDbAreaFeature[] {
  return Object.values(LDbCities).filter(f => f.properties.name.toLowerCase() === name.toLowerCase())
}
