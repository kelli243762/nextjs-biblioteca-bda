import { query } from '@/lib/db';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const searchSchema = z.object({
  fecha_inicio: z.string().optional(),
  fecha_fin: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
});

export default async function ResumenMultasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const { fecha_inicio, fecha_fin, page } = searchSchema.parse(params);
  const limit = 10;
  const offset = (page - 1) * limit;

  let whereClause = '';
  const queryParams: unknown[] = [];

  if (fecha_inicio && fecha_fin) {
    whereClause = 'WHERE mes BETWEEN $1 AND $2';
    queryParams.push(fecha_inicio, fecha_fin);
  } else if (fecha_inicio) {
    whereClause = 'WHERE mes >= $1';
    queryParams.push(fecha_inicio);
  } else if (fecha_fin) {
    whereClause = 'WHERE mes <= $1';
    queryParams.push(fecha_fin);
  }

  const limitIndex = queryParams.length + 1;

  const result = await query(
    'SELECT * FROM vw_fines_summary ' + whereClause + ' ORDER BY mes DESC LIMIT $' + limitIndex + ' OFFSET $' + (limitIndex + 1),
    [...queryParams, limit, offset]
  );

  const total = await query(
    'SELECT COUNT(*), SUM(monto_total) as gran_total, SUM(monto_pagado) as total_pagado, SUM(monto_pendiente) as total_pendiente FROM vw_fines_summary ' + whereClause,
    queryParams
  );

  const totalPages = Math.ceil(Number(total.rows[0].count) / limit);
  const extras = (fecha_inicio ? '&fecha_inicio=' + fecha_inicio : '') + (fecha_fin ? '&fecha_fin=' + fecha_fin : '');
  const prevUrl = '/reports/resumen-multas?page=' + String(page - 1) + extras;
  const nextUrl = '/reports/resumen-multas?page=' + String(page + 1) + extras;

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <a href="/" className="text-blue-500 text-sm mb-4 block">Volver al dashboard</a>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Resumen de multas</h1>
        <p className="text-gray-500 text-sm mb-6">
          Resumen mensual de multas generadas, pagadas y pendientes de cobro.
        </p>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-sm text-yellow-600">Monto total</p>
            <p className="text-3xl font-bold text-yellow-800">
              ${Number(total.rows[0].gran_total || 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-sm text-green-600">Total pagado</p>
            <p className="text-3xl font-bold text-green-800">
              ${Number(total.rows[0].total_pagado || 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm text-red-600">Total pendiente</p>
            <p className="text-3xl font-bold text-red-800">
              ${Number(total.rows[0].total_pendiente || 0).toFixed(2)}
            </p>
          </div>
        </div>

        <form method="GET" className="mb-6 flex gap-2 items-center flex-wrap">
          <label className="text-sm text-gray-600">Desde:</label>
          <input
            type="date"
            name="fecha_inicio"
            defaultValue={fecha_inicio}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
          />
          <label className="text-sm text-gray-600">Hasta:</label>
          <input
            type="date"
            name="fecha_fin"
            defaultValue={fecha_fin}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
          />
          <button type="submit" className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-600">
            Filtrar
          </button>
          {(fecha_inicio || fecha_fin) && (
            <a href="/reports/resumen-multas" className="px-4 py-2 text-sm text-gray-500 hover:underline">
              Limpiar
            </a>
          )}
        </form>

        <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left">Mes</th>
                <th className="px-4 py-3 text-right">Total multas</th>
                <th className="px-4 py-3 text-right">Monto total</th>
                <th className="px-4 py-3 text-right">Pagado</th>
                <th className="px-4 py-3 text-right">Pendiente</th>
                <th className="px-4 py-3 text-right">% Cobrado</th>
              </tr>
            </thead>
            <tbody>
              {result.rows.map((row, i) => (
                <tr key={i} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">
                    {new Date(row.mes).toLocaleDateString('es-MX', { year: 'numeric', month: 'long' })}
                  </td>
                  <td className="px-4 py-3 text-right">{row.total_multas}</td>
                  <td className="px-4 py-3 text-right font-semibold">
                    ${Number(row.monto_total).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right text-green-700">
                    ${Number(row.monto_pagado).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right text-red-700">
                    ${Number(row.monto_pendiente).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={
                      Number(row.porcentaje_cobrado) >= 75
                        ? 'px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700'
                        : Number(row.porcentaje_cobrado) >= 40
                        ? 'px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700'
                        : 'px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700'
                    }>
                      {row.porcentaje_cobrado}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex gap-2 mt-6 justify-center">
          {page > 1 && (
            <a href={prevUrl} className="px-4 py-2 bg-white border rounded-lg text-sm hover:bg-gray-50">
              Anterior
            </a>
          )}
          <span className="px-4 py-2 text-sm text-gray-500">
            Pagina {page} de {totalPages}
          </span>
          {page < totalPages && (
            <a href={nextUrl} className="px-4 py-2 bg-white border rounded-lg text-sm hover:bg-gray-50">
              Siguiente
            </a>
          )}
        </div>
      </div>
    </main>
  );
}