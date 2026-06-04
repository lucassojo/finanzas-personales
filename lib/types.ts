export interface Gasto {
  id: number;
  fecha: string;
  descripcion: string;
  nota_usuario?: string;
  categoria: string;
  monto: number;
  metodo_pago: string;
  created_at: string;
}

export interface Categoria {
  id: number;
  nombre: string;
  emoji: string;
  activa: number;
  created_at: string;
}

export interface Ingreso {
  id: number;
  mes: number;
  anio: number;
  descripcion: string;
  monto: number;
  created_at: string;
}

export interface Inversion {
  id: number;
  mes: number;
  anio: number;
  descripcion: string;
  monto: number;
  created_at: string;
}

export interface ClasificarResponse {
  gasto?: Gasto;
  error?: string;
  fallback?: boolean;
}

export interface ResumenCategoria {
  categoria: string;
  emoji: string;
  total: number;
  porcentaje: number;
}

export interface DatosDia {
  fecha: string;
  dia: string;
  total: number;
}
