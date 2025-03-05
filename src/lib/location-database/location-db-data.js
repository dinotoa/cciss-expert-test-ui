// l'implementazione è in JS perchè VSCode non riesce a gestire l'import di basi dati JSON grandi

import zoneData from "@/data/rdstmc-zones.json"
import regionData from "@/data/rdstmc-regions.json"
import provinceData from "@/data/rdstmc-provinces.json"
import cityData from "@/data/rdstmc-cities.json"
import roadData from "@/data/rdstmc-roads.json"
import segmentData from "@/data/rdstmc-segments.json"

export { regionData, provinceData, cityData }
