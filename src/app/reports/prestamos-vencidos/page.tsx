import { query } from '@/lib/db';
import { z } from 'zod';

const searchSchema = z.object({
  min_days: z.coerce.number().min(0).default(0),
  page: z.coerce.number().min(1).default(1),
});

export default async function PrestamosVencidosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const { min_days, page } = searchSchema.parse(params);
  const limit = 10;
  const offset = (page - 1) * limit;

  const result = await query(
    `SELECT * FROM vw_overdue_loans
     WHERE dias_atraso >= $1
     ORDER BY dias_atraso DESC
     LIMIT $2 OFFSET $3`,
    [min_days, limit, offset]
  );

  const total = await query(
    `SELECT COUNT(*), SUM(monto_sugerido) as total_monto
     FROM vw_overdue_loans
     WHERE dias_atraso >= $1`,
    [min_days]
  );

  const totalPages = Math.ceil(Number(total.rows[0].count) / limit);

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <a href="/" className="text-blue-500 text-sm mb-4 block">← Volver al dashboard</a>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Préstamos vencidos</h1>
        <p className="text-gray-500 text-sm mb-6">
          Préstamos no devueltos con días de atraso y monto sugerido de multa.
        </p>

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm text-red-600">Total préstamos vencidos</p>
            <p className="text-3xl font-bold text-red-800">{total.rows[0].count}</p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
            <p className="text-sm text-orange-600">Monto total sugerido</p>
            <p className="text-3xl font-bold text-orange-800">
              ${Number(total.rows[0].total_monto || 0).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Filtro */}
        <form method="GET" className="mb-6 flex gap-2 items-center">
          <label className="text-sm text-gray-600">Mínimo días de atraso:</label>
          <input
            type="number"
            name="min_days"
            defaultValue={min_days}
            min={0}
            className="border rounded-lg px-4 py-2 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-red-300"
          />
          <button
            type="submit"
            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700"
          >
            Filtrar
          </button>
          {min_days > 0 && (
            <a href="/reports/prestamos-vencidos" className="px-4 py-2 text-sm text-gray-500 hover:underline">
              Limpiar
            </a>
          )}
        </form>

        {/* Tabla */}
        <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left">Socio</th>
                <th className="px-4 py-3 text-left">Libro</th>
                <th className="px-4 py-3 text-left">Fecha límite</th>
                <th className="px-4 py-3 text-right">Días atraso</th>
                <th className="px-4 py-3 text-right">Monto sugerido</th>
              </tr>
            </thead>
            <tbody>
              {result.rows.map((row, i) => (
                <tr key={i} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium">{row.member_name}</p>
                    <p className="text-gray-400 text-xs">{row.member_email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{row.book_title}</p>
                    <p className="text-gray-400 text-xs">{row.book_author}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(row.due_at).toLocaleDateString('es-MX')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full font-semibold">
                      {row.dias_atraso} días
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-orange-700">
                    ${Number(row.monto_sugerido).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="flex gap-2 mt-6 justify-center">
          {page > 1 && (
            
              href={`/reports/prestamos-vencidos?page=${page - 1}&min_days=${min_days}`}
              className="px-4 py-2 bg-white border rounded-lg text-sm hover:bg-gray-50"
            >
              ← Anterior
            </a>
          )}
          <span className="px-4 py-2 text-sm text-gray-500">
            Página {page} de {totalPages}
          </span>
          {page < totalPages && (
            
              href={`/reports/prestamos-vencidos?page=${page + 1}&min_days=${min_days}`}
              className="px-4 py-2 bg-white border rounded-lg text-sm hover:bg-gray-50"
            >
              Siguiente →
            </a>
          )}
        </div>
      </div>
    </main>
  );
}