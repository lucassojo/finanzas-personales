import { Metadata } from 'next';
import ResumenClient from '@/components/ResumenClient';

export const metadata: Metadata = {
  title: 'Resumen — Mis Finanzas',
  description: 'Resumen mensual de tus gastos con gráficos y desglose por categoría.',
};

export default function ResumenPage() {
  return <ResumenClient />;
}
