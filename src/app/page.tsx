export const dynamic = 'force-dynamic';

import Link from 'next/link';

const reportes = [
  {
    href: '/reports/libros-populares',
    titulo: 'Libros mas prestados',
    descripcion: 'Ranking de libros con mayor demanda en la biblioteca.',
    color: 'bg-blue-50 border-blue-200',
  },
  {
    href: '/reports/prestamos-vencidos',
    titulo: 'Prestamos vencidos',
    descripcion: 'Prestamos no devueltos con dias de atraso y monto sugerido.',
    color: 'bg-red-50 border-red-200',
  },
  {
    href: '/reports/resumen-multas',
    titulo: 'Resumen de multas',
    descripcion: 'Resumen mensual de multas pagadas y pendientes.',
    color: 'bg-yellow-50 border-yellow-200',
  },
  {
    href: '/reports/actividad-socios',
    titulo: 'Actividad de socios',
    descripcion: 'Socios activos con su tasa de atraso y nivel de actividad.',
    color: 'bg-green-50 border-green-200',
  },
  {
    href: '/reports/inventario',
    titulo: 'Salud del inventario',
    descripcion: 'Estado del inventario por categoria: disponibles, prestados y perdidos.',
    color: 'bg-purple-50 border-purple-200',
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Dashboard Biblioteca
        </h1>
        <p className="text-gray-500 mb-8">
          Sistema de reportes y analisis de prestamos
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reportes.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className={'block border rounded-xl p-6 hover:shadow-md transition ' + r.color}
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-1">
                {r.titulo}
              </h2>
              <p className="text-sm text-gray-600">{r.descripcion}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}