import { MapRectangle } from "@/lib/location-database/geography"
import { logWarn } from "@/lib/logging"
import { point, lineString } from "@turf/turf"
import { Feature, Geometry, Position } from "geojson"
import { Icon, Layer } from "leaflet"
import React from "react"
import { GeoJSON, Marker, Popup } from "react-leaflet"

interface FeatureLayerProps extends React.HTMLProps<HTMLElement> {
    features: Feature<Geometry, any>[]
    selectedFeature?: Feature<Geometry, any> | null
    setSelectedFeature?: (feature: Feature<Geometry, any>) => void
    setMapMBR: (mbr: MapRectangle) => void
    createIcon: (feature: Feature<Geometry, any>, selected: boolean) => Icon
    createPanel: (Feature: Feature<Geometry, any>, setMapMBR: (mbr: MapRectangle) => void) => React.ReactNode
}

const FeatureLayer: React.FC<FeatureLayerProps> = ({ features, selectedFeature, setSelectedFeature,
    setMapMBR, createPanel, createIcon }) => {
    return features?.map(feat => {
        const selected = feat.properties.id === selectedFeature?.properties.id
        const icon = createIcon(feat, false)
        const selectedIcon = createIcon(feat, true)
        const popup = <Popup>{createPanel(feat, setMapMBR)}</Popup>
        switch (feat.geometry.type) {
            case "Polygon":
            case "MultiPolygon":
                return <PolygonLayer key={feat.properties.id} feature={feat}
                    icon={selected ? selectedIcon : icon} popup={popup}
                    selected={selected} setSelectedFeature={setSelectedFeature} />

            case "Point":
                return <PointLayer key={feat.properties.id} feature={feat}
                    icon={selected ? selectedIcon : icon} popup={popup}
                    selected={selected} setSelectedFeature={setSelectedFeature} />

            case "LineString":
                return <LineLayer key={feat.properties.id} feature={feat}
                    icon={selected ? selectedIcon : icon} popup={popup}
                    selected={selected} setSelectedFeature={setSelectedFeature} />

            case "MultiPoint":
                return <MultiPointLayer key={feat.properties.id} feature={feat}
                    icon={selected ? selectedIcon : icon} popup={popup}
                    selected={selected} setSelectedFeature={setSelectedFeature} />

            case "MultiLineString":
                return <MultilineLayer key={feat.properties.id} feature={feat}
                    icon={selected ? selectedIcon : icon} popup={popup}
                    selected={selected} setSelectedFeature={setSelectedFeature} />

            default:
                logWarn("FeatureLayer: unknown geometry type", feat.geometry.type)
                break;
        }
    })
}

interface FeaturePopupProps extends React.HTMLProps<HTMLElement> {
    feature: Feature<Geometry, any>
    onEachFeature?: (feature: Feature<Geometry, any>, layer: Layer) => void
    selected: boolean
    setSelectedFeature?: (feature: Feature<Geometry, any>) => void
    icon: Icon
    popup: React.ReactNode
}

const PointLayer: React.FC<FeaturePopupProps> = ({ feature, icon, popup, setSelectedFeature }) => {
    return feature.geometry.type === "Point" ?
        <Marker key={feature.properties.id} eventHandlers={{ click: () => setSelectedFeature && setSelectedFeature(feature) }}
            position={[feature.geometry.coordinates[1], feature.geometry.coordinates[0]]} icon={icon}>
            {popup}
        </Marker>
        : null
}

const MultilineLayer: React.FC<FeaturePopupProps> = ({ feature, selected, icon, popup, setSelectedFeature }) => {
    return feature.geometry.type === "MultiLineString" ?
        <>
            <GeoJSON data={feature} style={{ color: selected ? "red" : "blue" }}
                onEachFeature={(f, l) => setSelectedFeature && l.on("click", () => setSelectedFeature(f))} >
                {popup}
            </GeoJSON>
            {feature.geometry.coordinates
                .flatMap((coord, idx) => <LineLayer key={`${feature.properties.id}-${idx}`}
                    selected={selected} setSelectedFeature={setSelectedFeature}
                    popup={popup} feature={lineString(coord, feature.properties)} icon={icon} />)
            }
        </>
        : null
}

const LineLayer: React.FC<FeaturePopupProps> = ({ feature, icon, popup, selected, setSelectedFeature }) => {
    return feature.geometry.type === "LineString" ?
        <>
            <GeoJSON data={feature} style={{ color: selected ? "red" : "blue" }}
                onEachFeature={(f, l) => setSelectedFeature && l.on("click", () => setSelectedFeature(f))} >
                {popup}
            </GeoJSON>
            {feature.geometry.coordinates
                .map((coord: Position, idx: number) => <PointLayer key={`${feature.properties.id}-${idx}`}
                    selected={selected} setSelectedFeature={setSelectedFeature}
                    popup={popup} feature={point(coord, feature.properties)} icon={icon} />
                )}
        </>
        : null
}

const MultiPointLayer: React.FC<FeaturePopupProps> = ({ feature, icon, popup, selected, setSelectedFeature }) => {
    return feature.geometry.type === "MultiPoint" ?
        <>
            {feature.geometry.coordinates
                .map((coord: Position, idx: number) => <PointLayer key={`${feature.properties.id}-${idx}`}
                    selected={selected} setSelectedFeature={setSelectedFeature}
                    popup={popup} feature={point(coord, feature.properties)} icon={icon} />
                )}
        </>
        : null
}

const PolygonLayer: React.FC<FeaturePopupProps> = ({ feature, icon, popup, selected, setSelectedFeature }) => {
    return feature.geometry.type === "Polygon" || feature.geometry.type === "MultiPolygon" ?
        <GeoJSON data={feature} style={{ color: selected ? "red" : "blue" }}
            onEachFeature={(f, l) => setSelectedFeature && l.on("click", () => setSelectedFeature(f))} >
            {popup}
        </GeoJSON>
        : null
}

export default FeatureLayer
