export interface SpatialBBox {
  west: number;
  south: number;
  east: number;
  north: number;
}

export type SpatialRelation = 'intersects' | 'within' | 'contains';

export interface SpatialFilterData {
  bbox: SpatialBBox;
  relation: SpatialRelation;
}
