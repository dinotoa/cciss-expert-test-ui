"use server"
import { logInfo } from "../logging";
import { getFeaturesById } from "./location-db";
import { LDbFeature } from "./location-db-types";

export async function getLdbFeatures(ids: number[]): Promise<LDbFeature[]> {
  logInfo("getLdbFeatures: loading", ids.length, "features")
  return getFeaturesById(ids)
}

