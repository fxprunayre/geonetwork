export interface Datasource {
  url: string;
  format:
    | 'csv'
    | 'parquet'
    | 'json'
    | 'geojson'
    | 'gml'
    | 'wfs'
    | 'arrow'
    | 'gdal'
    | 'xlsx'
    | 'xls';
  layer?: string;
}
