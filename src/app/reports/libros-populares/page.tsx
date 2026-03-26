import { query } from '@/lib/db';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const searchSchema = z.object({
  search: z.string().max(100).optional(),
  page: z.coerce.number().min(1).default(1),
});

export default async function LibrosPopularesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const { search, page } = searchSchema.parse(params);
  const limit = 10;
  const offset = (page - 1) * limit;

  const whereClause = search ? 'WHERE title ILIKE $1 OR author ILIKE $1' : '';
  const queryParams = search ? ['%' + search + '%', limit, offset] : [limit, offset];
  const limitIndex = search ? 2 : 1;

  const result = await query(
    'SELECT * FROM vw_most_borrowed_books ' + whereClause + ' ORDER BY ranking LIMIT $' + limitIndex + ' OFFSET $' + (limitIndex + 1),
    queryParams
  );

  const total = await query(
    'SELECT COUNT(*) FROM vw_most_borrowed_books ' + whereClause,
    search ? ['%' + search + '%'] : []
  );

  const totalPages = Math.ceil(Number(total.rows[0].count) / limit);
  const prevUrl = '/reports/libros-populares?page=' + String(page - 1) + (search ? '&search=' + search : '');
  const nextUrl = '/reports/libros-populares?page=' + String(page + 1) + (search ? '&search=' + search : '');

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <a href="/" className="text-blue-500 text-sm mb-4 block">Volver al dashboard</a>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Libros mas prestados</h1>
        <p className="text-gray-500 text-sm mb-6">
          Ranking de libros con mayor demanda. Usa busqueda para filtrar por titulo o autor.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 inline-block">
          <p className="text-sm text-blue-600">Total de libros registrados</p>
          <p className="text-3xl font-bold text-blue-800">{total.rows[0].count}</p>
        </div>

        <form method="GET" className="mb-6 flex gap-2">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Buscar por titulo o autor..."
            className="border rounded-lg px-4 py-2 text-sm w-80 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
            Buscar
          </button>
          {search && (
            <a href="/reports/libros-populares" className="px-4 py-2 text-sm text-gray-500 hover:underline">
              Limpiar
            </a>
          )}
        </form>

        <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left">Ranking</th>
                <th className="px-4 py-3 text-left">Titulo</th>
                <th className="px-4 py-3 text-left">Autor</th>
                <th className="px-4 py-3 text-left">Categoria</th>
                <th className="px-4 py-3 text-right">Prestamos</th>
              </tr>
            </thead>
            <tbody>
              {result.rows.map((row, i) => (
                <tr key={i} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-bold text-blue-600">#{row.ranking}</td>
                  <td className="px-4 py-3 font-medium">{row.title}</td>
                  <td className="px-4 py-3 text-gray-600">{row.author}</td>
                  <td className="px-4 py-3 text-gray-500">{row.category}</td>
                  <td className="px-4 py-3 text-right font-semibold">{row.total_prestamos}</td>
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