import { gql } from "graphql-request"
import { graphqlDataFetch, jsonDataFetch } from "./network"
import { mapFeatureMbr, mapFeatureVertices, MapPoint, MapRectangle } from "./geography"
import { FeatureCollection } from "geojson"
import { EventEmitter } from "stream"

const CITY_QUERY = gql`
query {
   Iniziativa(filter: { status: { _eq: "published" } }) {
    id
    nome
    slug
    bounding_box
    centro
  }
}`

interface InitiativeResponse {
  Iniziativa: {
    id: string
    nome: string
    slug: string
    bounding_box: {
      type: string
      coordinates: number[][][]
    }
    centro: {
      type: string
      coordinates: number[]
    }
  }[]
}

export interface InitiativeData {
  id: string
  name: string
  slug: string
  center: MapPoint
  bounding_box: MapRectangle
  homePage: string
}


export async function fetchInitiativeData(url: string) {
  const response = await graphqlDataFetch(url, CITY_QUERY)
  if (response.error) {
    return { error: response.error }
  }
  const rawData = response.data as InitiativeResponse
  const data = rawData.Iniziativa
    .filter(city => city.slug !== "italia")
    .map(city => {
      return {
        id: city.id,
        name: city.nome,
        slug: city.slug,
        bounding_box: reduceBoundingBox(city.bounding_box.coordinates),
        center: [city.centro.coordinates[1], city.centro.coordinates[0]],
        homePage: `https://${city.slug}.luceverde.it`,
      } as InitiativeData
    })
    .sort((a, b) => a.name.localeCompare(b.name))

  return { data }
}

export async function fetchInitiativeDataByName(url: string, name: string) {
  const response = await fetchInitiativeData(url)
  if (response.error) {
    return { error: response.error }
  }
  const data = response.data ? response.data : []
  return { data: data.find(city => city.name.toLowerCase() === name.toLowerCase()) }
}

function reduceBoundingBox(boundingBox: number[][][]): number[][] {
  let minPoint = [boundingBox[0][0][1], boundingBox[0][0][0]]
  let maxPoint = [boundingBox[0][0][1], boundingBox[0][0][0]]

  for (let i = 0; i < boundingBox[0].length; i++) {
    minPoint = [Math.min(minPoint[0], boundingBox[0][i][1]), Math.min(minPoint[1], boundingBox[0][i][0])]
    maxPoint = [Math.max(maxPoint[0], boundingBox[0][i][1]), Math.max(maxPoint[1], boundingBox[0][i][0])]
  }
  return [minPoint, maxPoint]
}

export interface SimpleTrafficEvent {
  id: string,
  priority: number,
  lastUpdated: string,
  event: string
  location: string
}

export interface TrafficEvent extends SimpleTrafficEvent {
  city: string
  icon: string
  event: string
  location: string
  positions: MapPoint[]
  mbr: MapRectangle
}

export function mapTrafficEventToSimpleTrafficEvent(event: TrafficEvent) {
  const simpleEvent : SimpleTrafficEvent = {
    id: event.id,
    priority: event.priority,
    lastUpdated: event.lastUpdated,
    event: event.event,
    location: event.location
  }
  return simpleEvent
}

export async function fetchTrafficDataBySlug(url: string, slug: string) {
  const rawData = await jsonDataFetch<FeatureCollection>(`${url}/${slug}`)
  if (rawData.error) {
    return { error: rawData.error }
  }
  const data = rawData.data?.features.map((feature, index) => ({
    id: feature.properties?.id ?? index.toString(),
    lastUpdated: feature.properties?.updateDate,
    city: slug,
    priority: feature.properties?.priority ?? 0,
    icon: `https://luceverde.it/assets/lvd-icons/dark/svg/${feature.properties?.iconName?.toLowerCase() ?? "default"}.svg`,
    event: `${feature.properties?.event?.it ?? ""} ${feature.properties?.note?.it ?? ""}`.trim(),
    location: `${feature.properties?.road ?? ""} ${feature.properties?.translation.it ?? ""}`.trim(),
    positions: mapFeatureVertices(feature.geometry),
    mbr: mapFeatureMbr(feature.geometry)
  } as TrafficEvent))
  return { data }
}

export async function fetchSimpleTrafficDataBySlug(url: string, slug: string) {
  const rawData = await jsonDataFetch<FeatureCollection>(`${url}/${slug}`)
  if (rawData.error) {
    return { error: rawData.error }
  }
  const data = rawData.data?.features.map((feature, index) => ({
    id: feature.properties?.id ?? index.toString(),
    lastUpdated: feature.properties?.updateDate,
    priority: feature.properties?.priority ?? 0,
    event: `${feature.properties?.event?.it ?? ""} ${feature.properties?.note?.it ?? ""}`.trim(),
    location: `${feature.properties?.road ?? ""} ${feature.properties?.translation.it ?? ""}`.trim(),
  } as SimpleTrafficEvent))
  return { data }
}

interface RawTemperature {
  day: number,
  min: number,
  max: number,
  night: number,
}

interface RawWeatherData {
  dt: number;
  sunrise: number;
  sunset: number;
  temp: RawTemperature;
  feels_like: RawTemperature;
  pressure: number;
  humidity: number;
  dew_point: number;
  uvi: number;
  clouds: number;
  visibility: number;
  wind_speed: number;
  wind_deg: number;
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  }[];
}

interface RawWeatherServiceResponse {
  lat: number
  lon: number
  timezone: string;
  timezone_offset: number
  current: RawWeatherData
  daily: RawWeatherData[]
};

export interface WeatherData {
  date: string
  temp: RawTemperature;
  pressure: number;
  humidity: number;
  clouds: number;
  forecast: string;
  icon: string;
}

export async function fetchWeatherData(lat: number, lng: number) {
  const url = process.env.WEATHER_DATA_ENDPOINT
  if (url) {
    const response = await jsonDataFetch<RawWeatherServiceResponse>(url, {
      lang: "it",
      units: "metric",
      exclude: "current,minutely,hourly,alerts",
      lat: lat.toString(),
      lon: lng.toString()
    })
    if (response.error) {
      return { error: response.error }
    }
    if (response.data?.daily) {
      const weatherData = response.data?.daily?.map(day => {
        return {
          date: new Date((day.dt + response.data!.timezone_offset) * 1000).toISOString().split("T")[0],
          temp: day.temp,
          pressure: day.pressure,
          humidity: day.humidity,
          clouds: day.clouds,
          icon: `https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`,
          forecast: day.weather[0].description
        } as WeatherData
      })
      return { data: weatherData }
    }
  }
  return { error: "internal error: missing WEATHER_DATA_ENDPOINT" }
}

const MEDIA_QUERY = gql`query {
  media_content(filter: {_and: [
    { iniziativa: {status: {_eq: "published"}}}, 
    { tipo: { _nnull: true } },
    { link: { _nnull: true } },
    { titolo: { _nnull: true } }
  ]}) {
    tipo
    titolo
    link
    iniziativa {
      id
    }
  }
}`

interface RawMediaQueryResponse {
  media_content: LvdMediaData[]
}

export interface LvdMediaData {
  tipo: "audio" | "video",
  titolo: string,
  link: string,
  iniziativa: {
    id: string,
  }
}

export async function lvdFetchMedia(url: string) {
  const rawResponse = await graphqlDataFetch<RawMediaQueryResponse>(url, MEDIA_QUERY)
  if (rawResponse.error) {
    return { error: rawResponse.error }
  }
  return { data: rawResponse.data?.media_content }
}