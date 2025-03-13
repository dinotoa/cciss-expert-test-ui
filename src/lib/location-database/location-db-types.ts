import type { Feature, Geometry } from "geojson"
import { MapPoint, MapRectangle } from "./geography"
import { z } from "zod"

export enum LdbFeatureTypeEnum {
  Zone = "zona",
  Region = "regione",
  Province = "provincia",
  City = "città",
  Road = "strada",
  Point = "punto",
  Address = "indirizzo"
}

export const ZLdbFeatureTypeEnum = z.enum([
  LdbFeatureTypeEnum.Zone, LdbFeatureTypeEnum.Region, LdbFeatureTypeEnum.Province, LdbFeatureTypeEnum.City, 
  LdbFeatureTypeEnum.Road, LdbFeatureTypeEnum.Point, LdbFeatureTypeEnum.Address])
 
export interface LDbFeatureProps {
  id: number
  lcd: number
  parentAreaId: number
  type: LdbFeatureTypeEnum
  tmcTypeId: string
  tmcTypeDescription: string
  name: string
  mbr?: MapRectangle
  centroid?: MapPoint
}

export interface LDbPointProps extends LDbFeatureProps {
  parentRoadId: number
  parentSegmentId: number
  nextInChainId: number
  prevInChainId: number
  firstName?: string
  secondName?: string
}

export interface LDbRoadProps extends LDbPointProps {
  roadNumber?: string
  pointIdChain: number[]
  segmentIdChain: number[]
}

export type LDbAreaFeature = Feature<Geometry, LDbFeatureProps>
export type LDbPointFeature = Feature<Geometry, LDbPointProps>
export type LDbRoadFeature = Feature<Geometry, LDbRoadProps>
export type LdbFeature = LDbAreaFeature | LDbPointFeature | LDbRoadFeature

export function isArea(type: LdbFeatureTypeEnum) {
  return type === LdbFeatureTypeEnum.Zone || type === LdbFeatureTypeEnum.Region ||
    type === LdbFeatureTypeEnum.Province || type === LdbFeatureTypeEnum.City
}

export function isRoad(type: LdbFeatureTypeEnum) {
  return type === LdbFeatureTypeEnum.Road || type === LdbFeatureTypeEnum.Point || type === LdbFeatureTypeEnum.Address
}

export function isParentType(parentType: LdbFeatureTypeEnum, type: LdbFeatureTypeEnum) {
  switch (type) {
    case LdbFeatureTypeEnum.Zone:
    case LdbFeatureTypeEnum.Region:
      return false

    case LdbFeatureTypeEnum.Province:
      return parentType === LdbFeatureTypeEnum.Region

    case LdbFeatureTypeEnum.City:
      return parentType === LdbFeatureTypeEnum.Province || parentType === LdbFeatureTypeEnum.Region

    case LdbFeatureTypeEnum.Road:
    case LdbFeatureTypeEnum.Point:
    case LdbFeatureTypeEnum.Address:
      return true

    default:
      return false
  }
}

export function getAreaParentType(type: LdbFeatureTypeEnum) {
  switch (type) {
    case LdbFeatureTypeEnum.Province:
      return LdbFeatureTypeEnum.Region
    case LdbFeatureTypeEnum.City:
      return LdbFeatureTypeEnum.Province
    default:
    // falls through
  }
  return undefined
}

export function getChildAreaTypes(type: LdbFeatureTypeEnum): LdbFeatureTypeEnum[] {
  switch (type) {
    case LdbFeatureTypeEnum.Region:
      return [LdbFeatureTypeEnum.Province, LdbFeatureTypeEnum.City]
    case LdbFeatureTypeEnum.Province:
      return [LdbFeatureTypeEnum.City]
  }
  return []
}