import { query } from '@/lib/db';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const searchSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  member_type: z.enum(['estudiante', 'docente', 'externo', 'todos']).default('todos'),
});

export default async function ActividadSociosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const { page, member_type } = searchSchema.parse(params);
  const limit = 10;
  const offset = (page - 1) * limit;

  const whereClause = member_type !== 'todos' ? 'WHERE member_type = $1' : '';
  const queryParams = member_type !== 'todos' ? [member_type] : [];
  const limitIndex = queryParams.length + 1;

  const result = await query(
    'SELECT * FROM vw_member_activity ' + whereClause + ' ORDER BY total_prestamos DESC LIMIT $' + limitIndex + ' OFFSET $' + (limitIndex + 1),
    [...queryParams, limit, offset]
  );

  const total = await query(
    'SELECT COUNT(*), SUM(total_prestamos) as total_prestamos, ROUND(AVG(tasa_atraso), 2) as promedio_atraso FROM vw_member_activity ' + whereClause,
    queryParams
  );

  const totalPages = Math.ceil(Number(total.rows[0].count) / limit);
  const prevUrl = '/reports/actividad-socios?page=' + String(page - 1) + '&member_type=' + member_type;
  const nextUrl = '/reports/actividad-socios?page=' + String(page + 1) + '&member_type=' + member_type;

  const nivelColor: Record<string, string> = {
    'muy activo': 'px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700',
    'activo': 'px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700',
    'poco activo': 'px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700',
    'sin actividad': 'px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500',
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <a href="/" className="text-blue-500 text-sm mb-4 block">Volver al dashboard</a>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Actividad de socios</h1>
        <p className="text-gray-500 text-sm mb-6">
          Listado de socios con su nivel de actividad y tasa de atraso en devoluciones.
        </p>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-sm text-green-600">Total socios</p>
            <p className="text-3xl font-bold text-green-800">{total.rows[0].count}</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-600">Total prestamos</p>
            <p className="text-3xl font-bold text-blue-800">{total.rows[0].total_prestamos}</p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
            <p className="text-sm text-orange-600">Promedio tasa atraso</p>
            <p className="text-3xl font-bold text-orange-800">{total.rows[0].promedio_atraso}%</p>
          </div>
        </div>

        <form method="GET" className="mb-6 flex gap-2 items-center">
          <label className="text-sm text-gray-600">Tipo de socio:</label>
          <select
            name="member_type"
            defaultValue={member_type}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
          >
            <option value="todos">Todos</option>
            <option value="estudiante">Estudiante</option>
            <option value="docente">Docente</option>
            <option value="externo">Externo</option>
          </select>
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
            Filtrar
          </button>
          {member_type !== 'todos' && (
            <a href="/reports/actividad-socios" className="px-4 py-2 text-sm text-gray-500 hover:underline">
              Limpiar
            </a>
          )}
        </form>

        <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left">Socio</th>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-right">Prestamos</th>
                <th className="px-4 py-3 text-right">Atrasados</th>
                <th className="px-4 py-3 text-right">Tasa atraso</th>
                <th className="px-4 py-3 text-center">Nivel</th>
              </tr>
            </thead>
            <tbody>
              {result.rows.map((row, i) => (
                <tr key={i} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium">{row.member_name}</p>
                    <p className="text-gray-400 text-xs">{row.member_email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 capitalize">{row.member_type}</td>
                  <td className="px-4 py-3 text-right font-semibold">{row.total_prestamos}</td>
                  <td className="px-4 py-3 text-right text-red-600">{row.prestamos_atrasados}</td>
                  <td className="px-4 py-3 text-right">{row.tasa_atraso}%</td>
                  <td className="px-4 py-3 text-center">
                    <span className={nivelColor[row.nivel_actividad] || 'px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500'}>
                      {row.nivel_actividad}
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