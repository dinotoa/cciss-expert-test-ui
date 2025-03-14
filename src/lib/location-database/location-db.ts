import { FeatureCollection, Geometry } from "geojson"
import { logErr } from "../logging"
import { cityData, provinceData, regionData, roadData } from "./location-db-data"
import { getChildAreaTypes, isRoad, LDbAreaFeature, LDbFeature, LDbFeatureProps, LdbFeatureTypeEnum, LDbRoadFeature, LDbRoadProps } from "./location-db-types"

const LDbRegions = (regionData as unknown as FeatureCollection<Geometry, LDbFeatureProps>).features.reduce(reduceAreaFeatures, {})
const LDbProvinces = (provinceData as unknown as FeatureCollection<Geometry, LDbFeatureProps>).features.reduce(reduceAreaFeatures, {});
const LDbCities = (cityData as unknown as FeatureCollection<Geometry, LDbFeatureProps>).features.reduce(reduceAreaFeatures, {});
const LDbAreas = {
  ...LDbRegions,
  ...LDbProvinces,
  ...LDbCities,
}
const LDbRoads = (roadData as unknown as FeatureCollection<Geometry, LDbRoadProps>).features.reduce(reduceRoadFeatures, {})

export function getLocationsByTypeName(type: LdbFeatureTypeEnum, name: string): LDbFeature[] {
  switch (type) {
    case LdbFeatureTypeEnum.Region:
      return getAreasByName(LDbRegions, name)
    case LdbFeatureTypeEnum.Province:
      return getAreasByName(LDbProvinces, name)
    case LdbFeatureTypeEnum.City:
      return getAreasByName(LDbCities, name)
    default:
      logErr(`LDB: Invalid location type ${type}`)
      throw new Error(`Invalid location type ${type}`)
  }
}

export function isParentType(parentType: LdbFeatureTypeEnum, childType: LdbFeatureTypeEnum): boolean {
  switch (parentType) {
    case LdbFeatureTypeEnum.Region:
      return isRoad(childType) || childType in [LdbFeatureTypeEnum.Province, LdbFeatureTypeEnum.City]
    case LdbFeatureTypeEnum.Province:
      return isRoad(childType) || childType in [LdbFeatureTypeEnum.City]
    case LdbFeatureTypeEnum.City:
      return isRoad(childType)
  }
  return isRoad(childType) && isRoad(parentType)
}

export function getAreaChildren(area: LDbAreaFeature, childrenType: LdbFeatureTypeEnum): LDbAreaFeature[] {
  const childTypes = getChildAreaTypes(area.properties.type)
  if (childTypes.includes(childrenType)) {
    let children: LDbAreaFeature[] = [area]
    for (const childType of childTypes) {
      const parentIds = new Set(children.map(c => c.properties.id))
      children = Object.values(LDbAreas)
        .filter((a: LDbAreaFeature) => (a.properties.type === childType) && parentIds.has(a.properties.parentAreaId))
      if (childType === childrenType) {
        break
      }
    }
    return children
  }
  return []
}

export function getFeaturesById(ids: number[]): LDbFeature[] {
  return ids.map(id => LDbAreas[id] || LDbRoads[id])
}

function getAreasByName(areas: { [id: number]: LDbAreaFeature }, name: string): LDbAreaFeature[] {
  const normalizedName = normalizeName(name)
  return Object.values(areas).filter(f => normalizeName(f.properties.name.toLowerCase()) === normalizedName)
}

function normalizeName(name: string): string {
  return name.toLowerCase().trim().replace(/[\s+\p{P}]+/gu, " ").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

function reduceAreaFeatures(acc: { [id: number]: LDbAreaFeature }, feat: LDbAreaFeature) {
  acc[feat.properties.id] = feat
  return acc
}

function reduceRoadFeatures(acc: { [id: number]: LDbRoadFeature }, feat: LDbRoadFeature) {
  acc[feat.properties.id] = feat
  return acc
}
