export interface Conformidad {
  id_correlativo: string;
  ruc: string;
  proveedor: string;
  nro_factura: string;
  nro_centro_costo: string;
  nro_orden_servicio: string;
  nro_of: string;
  solicitante: string;
  fecha_conformidad: string;
  descripcion_servicio: string;
  conformidad: boolean;
  observaciones: string;
  responsable: string;
  area: string;
  usuario_id: string;
  firma?: string;
}

export interface ConformidadFormData {
  ruc: string;
  proveedor: string;
  nro_factura: string;
  nro_centro_costo: string;
  nro_orden_servicio: string;
  nro_of: string;
  solicitante: string;
  fecha_conformidad: Date;
  descripcion_servicio: string;
  conformidad: 'si' | 'no';
  observaciones?: string;
  responsable: string;
  area: string;
  firma?: string;
}