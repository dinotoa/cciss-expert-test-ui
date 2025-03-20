import { FeatureCollection, Geometry } from "geojson"
import Fuse, { Expression } from "fuse.js"
import { logErr, logInfo } from "../logging"
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
    case LdbFeatureTypeEnum.Road:
      return getRoadsByName(name)
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

const ROAD_NUMBER_RS = /[a-z]+\s?\d+[a-z]*/i

function getRoadsByName(name: string): LDbFeature[] {
  const roadNumbers = name.match(ROAD_NUMBER_RS)
  const roadName = name.replace(ROAD_NUMBER_RS, "").trim()
  logInfo("getRoadsByName: road number:", roadNumbers, "road name:", roadName)
  const roadNumbersExpr = roadNumbers?.length
    ? { $or: roadNumbers.map(rn => `{ properties.roadNumber: "${rn}"}`) }
    : undefined
  logInfo("getRoadsByName: roadNumbersExpr:", roadNumbersExpr)
  const nameEprs = roadName?.length
    ? {
      $or: [
        `{ properties.name: "${roadName}" }`,
        `{ properties.firstName: "${roadName}" }`,
        `{ properties.secondName: "${roadName}" }`
      ]
    }
    : undefined
  logInfo("getRoadsByName: nameEprs:", nameEprs)
  const expression = roadNumbersExpr
    ? (nameEprs ? { $and: [roadNumbersExpr, nameEprs] } : roadNumbersExpr)
    : (nameEprs ? nameEprs : undefined)
  logInfo("getRoadsByName: expression:", expression)
  const roads = expression ? ROAD_FUSE.search(expression as Expression) : []
  logInfo("getRoadsByName: roads:", roads)
  return roads.map(r => r.item)
}

const ROAD_FUSE = new Fuse(Object.values(LDbRoads), {
  keys: ["properties.roadNumber", "properties.name"],
  ignoreDiacritics: true,
  includeScore: true,
  useExtendedSearch: true,
  threshold: 0.2
})

export function getRoads(roadNum?: string, roadName?: string, areaName?: string): LDbRoadFeature[] {
  const roadExpr = roadNum ? {
    "properties.roadNumber": `=${roadNum}`
  } as Expression :  undefined 
  const nameExpr = roadName ? {
    "properties.name": `${roadName}`
  } as Expression : undefined
  const searchExpr = roadExpr 
    ? (nameExpr ? { $and: [roadExpr, nameExpr] } : roadExpr)
    : nameExpr
  const roads = searchExpr ? ROAD_FUSE.search(searchExpr) : []
  // filter the roads w/o name (useful form autoroutes)
  logInfo("getRoads:", "found", roads.length, "roads")
  if ((roadName === undefined) || (roadName === null) || (roadName.length === 0)) {
    const filteredRoads = roads.filter(r => !(r.item.properties.name))
    if (filteredRoads.length) {
      logInfo("getRoads:", "filtered", filteredRoads.length, "roads")
      return filteredRoads.map(r => r.item)
    }
  }
  return roads.map(r => r.item)
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
