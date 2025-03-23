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
const LdbFeatures = Object.values({
  ...LDbAreas,
  ...LDbRoads
})

const FEATURE_SEARCH = new Fuse(LdbFeatures, {
  keys: ["properties.type", "properties.roadNumber", "properties.name"],
  ignoreDiacritics: true,
  includeScore: true,
  useExtendedSearch: true,
  threshold: 0.2
})

const STOP_WORDS = new Set(["e", "ed", "a", "ad", "o", "od",
  "il", "lo", "la", "i", "gli", "le", "l",
  "di", "da", "de", "del", "dal", "dell", "dall",
  "nel", "nell",
  "in", "con", "su", "per", "tra", "fra"
])

function normalizeSearch(searchString: string) {
  const result = searchString
    ? searchString
      .replace(/[\s+\p{P}]+/gu, " ")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .split(" ")
      .filter(w => !STOP_WORDS.has(w) && w.length > 1)
    : null
  return result
}

export function getLocationsByTypeName(type: LdbFeatureTypeEnum, code?: string, name?: string): LDbFeature[] {
  const results = featureSearch(type, code, name)
  if (results.length) {
    const [best, worst] = results.reduce(([best, worst], r) => [
      Math.max(best, 1 - (r.score ?? 0)),
      Math.min(worst, 1 - (r.score ?? 0))
    ], [-1, 1])
    logInfo("found ", results.length, " results for type:", type, " code:", code, " name:", name,
      "best:", best, " worst:", worst)
  } else {
    logErr("no results for type:", type, " code:", code, " name:", name)
  }
  return results.map(r => r.item)
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

function featureSearch(type: string, number?: string, name?: string, limit: number = 10) {
  const normalizedNumber = number?.length ? number.trim() : null
  const normalizedName = name ? normalizeSearch(name) : null
  const typeExpr = type?.trim().length ? { "properties.type": `=${type.trim()}` } : null
  const roadNumberExpr = normalizedNumber ? { "properties.roadNumber": `=${normalizedNumber.trim()}` } : null
  const nameExpr = normalizedName?.length ?
    {
      $and: normalizedName.map(n => ({ "properties.name": `'${n}` }))
    } as Expression : null
  const completeExpr = typeExpr || roadNumberExpr || nameExpr
    ? {
      $and: [typeExpr, roadNumberExpr, nameExpr].filter(e => e)
    } as Expression
    : null
  console.log(JSON.stringify(completeExpr))
  const results = completeExpr ? FEATURE_SEARCH.search(completeExpr, { limit }) : []
  return results
}

function reduceAreaFeatures(acc: { [id: number]: LDbAreaFeature }, feat: LDbAreaFeature) {
  acc[feat.properties.id] = feat
  return acc
}

function reduceRoadFeatures(acc: { [id: number]: LDbRoadFeature }, feat: LDbRoadFeature) {
  acc[feat.properties.id] = feat
  return acc
}
