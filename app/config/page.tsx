import { Metadata } from 'next';
import ConfigClient from '@/components/ConfigClient';

export const metadata: Metadata = {
  title: 'Configuración — Mis Finanzas',
  description: 'Configurá tu sueldo mensual y administrá tus categorías de gastos.',
};

export default function ConfigPage() {
  return <ConfigClient />;
}
