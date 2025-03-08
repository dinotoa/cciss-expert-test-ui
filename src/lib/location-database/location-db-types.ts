import type { Feature, FeatureCollection, Geometry } from "geojson";
import { z } from "zod";
import { MapRectangle } from "./geography";

export enum LdbFeatureTypeEnum {
  Zone = "zone",
  Region = "region",
  Province = "province",
  City = "city",
  Road = "road",
  Point = "point"
}

export interface LDbFeatureProps {
  type: LdbFeatureTypeEnum,
  tmcType: string,
  tmcTypeDescription: string
  id: number,
  parentAreaId: number,
  lcd: number,
  name: string,
  mbr: MapRectangle
  centroid: Geometry
}

export interface LDbPointProps extends LDbFeatureProps {
  parentRoadId: number,
  parentSegmentId: number,
  nextInChainId: number,
  prevInChainId: number
  roadNumber?: string,
  roadName: string,
  firstName?: string
  secondName?: string
}

export interface LDbRoadProps extends LDbPointProps {
  pointIdChain: number[]
  segmentIdChain: number[]
}

export type LDbAreaFeature = Feature<Geometry, LDbFeatureProps>;
export type LDbPointFeature = Feature<Geometry, LDbPointProps>;
export type LDbRoadFeature = Feature<Geometry, LDbRoadProps>;

export const ZLocationEnum = z.enum(["strada", "città", "regione", "provincia", "indirizzo"])
  .describe("valori che può assumente il tipo di località")
export type LocationEnum = z.infer<typeof ZLocationEnum>

export const ZLocationType = z.object({
  location: z.string().describe("località per la quali cercare le notizie di traffico."),
  locationType: ZLocationEnum
})
export type Location = z.infer<typeof ZLocationType>

export type LocationDataType = LDbAreaFeature | LDbRoadFeature | LDbPointFeature
