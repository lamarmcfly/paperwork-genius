declare module '@mapbox/mapbox-gl-draw' {
  interface DrawOptions {
    displayControlsDefault?: boolean
    controls?: {
      point?: boolean
      line_string?: boolean
      polygon?: boolean
      trash?: boolean
      combine_features?: boolean
      uncombine_features?: boolean
    }
    defaultMode?: string
    styles?: object[]
  }

  class MapboxDraw {
    constructor(options?: DrawOptions)
    onAdd(map: maplibregl.Map): HTMLElement
    onRemove(map: maplibregl.Map): void
    changeMode(mode: string, options?: object): this
    deleteAll(): this
    getAll(): GeoJSON.FeatureCollection
    add(geojson: GeoJSON.Feature | GeoJSON.FeatureCollection): string[]
    delete(ids: string | string[]): this
    getSelected(): GeoJSON.FeatureCollection
    getSelectedIds(): string[]
    setFeatureProperty(featureId: string, property: string, value: unknown): this
  }

  export default MapboxDraw
}
