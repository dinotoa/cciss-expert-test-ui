import { Feature, Geometry, Position } from "geojson"
import React, { Fragment } from "react"
import { GeoJSON, Marker, Popup } from "react-leaflet"
import { MapRectangle } from "@/lib/location-database/geography"
import { logWarn } from "@/lib/logging"
import { Icon } from "leaflet"
import { lineString, point } from "@turf/turf"

interface FeatureLayerProps extends React.HTMLProps<HTMLElement> {
    features: Feature<Geometry, any>[]
    setMapMBR: (mbr: MapRectangle) => void
    createIcon: (feature: Feature<Geometry, any>) => Icon
    createPanel: (Feature: Feature<Geometry, any>, setMapMBR: (mbr: MapRectangle) => void) => React.ReactNode
}

const FeatureLayer: React.FC<FeatureLayerProps> = ({ features, setMapMBR, createPanel, createIcon }) => {
    return features?.map(feat => {
        const icon = createIcon(feat)
        const popup = <Popup>{createPanel(feat, setMapMBR)}</Popup>
        switch (feat.geometry.type) {
            case "Polygon":
            case "MultiPolygon":
                return <GeoJSON key={feat.properties.id} data={feat}>
                    {popup}
                </GeoJSON>

            case "Point":
                return <PointLayer key={feat.properties.id} feature={feat} icon={icon} popup={popup} />

            case "LineString":
            case "MultiPoint":
                return <LineLayer key={feat.properties.id} feature={feat} icon={icon} popup={popup} />

            case "MultiLineString":
                return <MultilineLayer key={feat.properties.id} feature={feat} icon={icon} popup={popup} />

            default:
                logWarn("FeatureLayer: unknown geometry type", feat.geometry.type)
                break;
        }
    })
}

interface FeaturePopupProps extends React.HTMLProps<HTMLElement> {
    feature: Feature<Geometry, any>
    icon: Icon
    popup: React.ReactNode
}

const PointLayer: React.FC<FeaturePopupProps> = ({ feature, icon, popup }) => {
    return feature.geometry.type === "Point" ?
        <Marker key={feature.properties.id} position={[feature.geometry.coordinates[1], feature.geometry.coordinates[0]]} icon={icon}>
            {popup}
        </Marker>
        : null
}

const MultilineLayer: React.FC<FeaturePopupProps> = ({ feature, icon, popup }) => {
    return feature.geometry.type === "MultiLineString" ?
        <Fragment key={feature.properties.id}>
            <GeoJSON data={feature}>
                {popup}
            </GeoJSON>
            {feature.geometry.coordinates
                .flatMap((coord, idx) => <LineLayer key={`${feature.properties.id}-${idx}`}
                    feature={lineString(coord, feature.properties)} popup={popup} icon={icon} />)
            }
        </Fragment>
        : null
}

const LineLayer: React.FC<FeaturePopupProps> = ({ feature, icon, popup }) => {
    return feature.geometry.type === "LineString" || feature.geometry.type === "MultiPoint" ?
        <Fragment key={feature.properties.id}>
            <GeoJSON data={feature}>
                {popup}
            </GeoJSON>
            {feature.geometry.coordinates
                .map((coord: Position, idx: number) => <PointLayer key={`${feature.properties.id}-${idx}`}
                    popup={popup} feature={point(coord, feature.properties)} icon={icon} />
                )}
        </Fragment>
        : null
}

export default FeatureLayer
