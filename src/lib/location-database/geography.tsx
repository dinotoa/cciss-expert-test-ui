import { Geometry, GeometryCollection, LineString, MultiLineString, MultiPoint, MultiPolygon, Point, Polygon, Position } from "geojson";
import { logErr } from "../logging";

export type MapRectangle = [[number, number], [number, number]]
export type MapPoint = [number, number]

export interface AdminAreaData {
  "level": number,
  "areaId": number,
  "areaName": string,
  "parentAreaId": number,
  "parentAreaName": string,
  "centroid": {
    "y": number,
    "x": number
  },
  "mbr": MapRectangle
}

export function reduceMBR(initial: MapRectangle, next: MapRectangle): MapRectangle {
  return [
    [Math.min(initial[0][0], next[0][0]), Math.min(initial[0][1], next[0][1])],
    [Math.max(initial[1][0], next[1][0]), Math.max(initial[1][1], next[1][1])],
  ]
}

export function mapFeatureMbr(geometry: Geometry): MapRectangle {
  let minLat = Infinity;
  let minLng = Infinity;
  let maxLat = -Infinity;
  let maxLng = -Infinity;

  const updateBounds = (coords: Position) => {
    const [lng, lat] = coords;
    minLat = Math.min(minLat, lat);
    minLng = Math.min(minLng, lng);
    maxLat = Math.max(maxLat, lat);
    maxLng = Math.max(maxLng, lng);
  };

  switch (geometry.type) {
    case "Point":
      updateBounds((geometry as Point).coordinates);
      break;
    case "LineString":
      (geometry as LineString).coordinates.forEach(updateBounds);
      break;
    case "Polygon":
      (geometry as Polygon).coordinates.forEach(ring => ring.forEach(updateBounds));
      break;
    case "MultiPoint":
      (geometry as MultiPoint).coordinates.forEach(updateBounds);
      break;
    case "MultiLineString":
      (geometry as MultiLineString).coordinates.forEach(line => line.forEach(updateBounds));
      break;
    case "MultiPolygon":
      (geometry as MultiPolygon).coordinates.forEach(polygon =>
        polygon.forEach(ring => ring.forEach(updateBounds))
      );
      break;
    case "GeometryCollection":
      (geometry as GeometryCollection).geometries.forEach(mapFeatureMbr); // Recursively handle GeometryCollections
      break;
    default:
      throw new Error(`Unsupported geometry type: ${(geometry as Geometry).type}`);
  }

  return [[minLat, minLng], [maxLat, maxLng]];
}

export function mapFeatureVertices(geometry: Geometry): MapPoint[] {
  switch (geometry.type) {
    case "Point":
      return [[(geometry as Point).coordinates[1], (geometry as Point).coordinates[0]]]

    case "LineString":
      if ((geometry as LineString).coordinates.length > 1) {
        const coords = (geometry as LineString).coordinates

        return [[coords[0][1], coords[0][0]],
        [coords[coords.length - 1][1], coords[coords.length - 1][0]]]
      } else if ((geometry as LineString).coordinates.length > 0) {
        const coords = (geometry as LineString).coordinates
        return [[coords[0][1], coords[0][0]]]
      }
      break;
    case "MultiPoint":
      if ((geometry as MultiPoint).coordinates.length > 1) {
        const coords = (geometry as MultiPoint).coordinates

        return [[coords[0][1], coords[0][0]],
        [coords[coords.length - 1][1], coords[coords.length - 1][0]]]
      } else if ((geometry as MultiPoint).coordinates.length > 0) {
        const coords = (geometry as MultiPoint).coordinates
        return [[coords[0][1], coords[0][0]]]
      }
      break;
    case "Polygon":
      if ((geometry as Polygon).coordinates.length > 0){
        const centre = polygonCenter(geometry as Polygon)
        if (centre) {
          return [centre]
        }
      }
      break
    case "MultiLineString":
    case "MultiPolygon":
    case "GeometryCollection":
    default:
      logErr(`Unsupported geometry type: ${(geometry as Geometry).type}`);
    // falls through
  }

  return []
}

function polygonCenter(polygon: Polygon): MapPoint | null {
  if (!polygon || polygon.type !== "Polygon" || !polygon.coordinates.length) {
    return null; // Handle invalid or empty polygons
  }

  let totalLat = 0;
  let totalLng = 0;
  let numPoints = 0;

  // Only consider the exterior ring for the center calculation
  const exteriorRing = polygon.coordinates[0];

  exteriorRing.forEach(coords => {
    const [lng, lat] = coords;
    totalLat += lat;
    totalLng += lng;
    numPoints++;
  });

  if (numPoints === 0) {
    return null; // Handle cases where the exterior ring has no points
  }

  return [totalLat / numPoints, totalLng / numPoints];
}

export function inflateRectangle(mbr: MapRectangle, padding: number): MapRectangle {
  return [
    [mbr[0][0] - padding, mbr[0][1] - padding],
    [mbr[1][0] + padding, mbr[1][1] + padding]
  ]
}