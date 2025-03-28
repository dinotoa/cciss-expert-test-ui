import { FeatureCollection, Geometry } from "geojson"
import MiniSearch, { SearchResult } from "minisearch"
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
const LdbFeatures = {
  ...LDbAreas,
  ...LDbRoads
}

const FEATURES = [...Object.values(LdbFeatures)]
  .map(f => f.properties)
const FEATURE_SEARCH = new MiniSearch({
  fields: ["roadNumber", "name"],
  storeFields: ["id", "type", "parentAreaId"]
})
FEATURE_SEARCH.addAll(FEATURES)

const STOP_WORDS = new Set(["e", "ed", "a", "ad", "o", "od",
  "il", "lo", "la", "i", "gli", "le", "l",
  "di", "da", "de", "del", "dal", "dell", "dall",
  "nel", "nell",
  "in", "con", "su", "per", "tra", "fra"
])


export function getAreaIdHierarchy(areaId: number): number[] {
  const area = LDbAreas[areaId]
  if (area) {
    const hierarchy = [area.properties.id]
    for (const childType of nextInAreaHierarchy(area.properties.type)) {
      const children = Object.values(LDbAreas).filter(a => (a.properties.type === childType) && (hierarchy.includes(a.properties.parentAreaId)))
      if (children.length) {
        hierarchy.push(...children.map(a => a.properties.id))
      } else {
        break
      }
    }
    return hierarchy
  }
  return []
}

export function getLocationsByTypeName(type: LdbFeatureTypeEnum, code?: string, name?: string, areaHierarchy: number[] = [], limit: number = 10): LDbFeature[] {
  const results = featureSearch(type, code, name, areaHierarchy, limit)
  if (results?.length) {
    logInfo("found ", results.length, " results for type:", type, " code:", code, " name:", name)
  } else {
    logErr("no results for type:", type, " code:", code, " name:", name)
  }
  return results
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

function nextInAreaHierarchy(type: LdbFeatureTypeEnum) {
  switch (type) {
    case LdbFeatureTypeEnum.Region:
      return [LdbFeatureTypeEnum.Province, LdbFeatureTypeEnum.City]
    case LdbFeatureTypeEnum.Province:
      return [LdbFeatureTypeEnum.City]
  }
  return [] as LdbFeatureTypeEnum[]
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
  return ids.map(id => LdbFeatures[id])
}

function normalizeSearch(searchString: string) {
  const result = searchString
    ? searchString
      .replace(/[\s+\p{P}]+/gu, " ")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .split(" ")
      .filter(w => !STOP_WORDS.has(w) && w.length > 1)
    : null
  return result
}

function featureSearch(type: string, number?: string, name?: string, areaHierarchy: number[] = [], limit: number = 10) {
  const normalizedNumber = number?.length ? number.trim() : null
  const normalizedName = name ? normalizeSearch(name) : null
  const queries = []
  const areaSet = new Set(areaHierarchy)
  if (normalizedName?.length) {
    queries.push({ queries: normalizedName, fields: ["name"] })
  }
  if (normalizedNumber?.length) {
    queries.push({ queries: [normalizedNumber], fields: ["roadNumber"] })
  }
  if (queries.length) {
    const results = FEATURE_SEARCH.search({
      combineWith: "AND",
      queries
    }, {
      filter: (r: SearchResult) => (r.type === type) && ((areaSet?.size === 0) || (areaSet.has(r.parentAreaId)))
    }).slice(0, limit)
    const features = results.map(r => LdbFeatures[r.id])
    if (normalizedName && features.length > 1) {
      // try to find an exact match
      const normalizedNameSet = new Set(normalizedName)
      const exactMatch = features.find(a => isExactMatch(a, normalizedNameSet))
      if (exactMatch) {
        return [exactMatch]
      }
    }
    return features
  }
  return []
}

function isExactMatch(area: LDbFeature, name: Set<string>) {
  const areaNameSet = new Set(normalizeSearch(area.properties.name))
  return areaNameSet.intersection(name).size === name.size
}

function reduceAreaFeatures(acc: { [id: number]: LDbAreaFeature }, feat: LDbAreaFeature) {
  acc[feat.properties.id] = feat
  return acc
}

function reduceRoadFeatures(acc: { [id: number]: LDbRoadFeature }, feat: LDbRoadFeature) {
  acc[feat.properties.id] = feat
  return acc
}

