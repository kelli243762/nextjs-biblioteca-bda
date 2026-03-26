import { query } from '@/lib/db';

export default async function InventarioPage() {
  const result = await query(
    `SELECT * FROM vw_inventory_health ORDER BY total_copias DESC`
  );

  const totales = await query(
    `SELECT 
     SUM(total_copias) as total,
     SUM(disponibles) as disponibles,
     SUM(prestadas) as prestadas,
     SUM(perdidas) as perdidas,
     SUM(en_mantenimiento) as en_mantenimiento
     FROM vw_inventory_health`
  );

  const t = totales.rows[0];

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <a href="/" className="text-blue-500 text-sm mb-4 block">← Volver al dashboard</a>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Salud del inventario</h1>
        <p className="text-gray-500 text-sm mb-6">
          Estado actual del inventario agrupado por categoría de libro.
        </p>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
            <p className="text-sm text-purple-600">Total copias</p>
            <p className="text-3xl font-bold text-purple-800">{t.total}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-sm text-green-600">Disponibles</p>
            <p className="text-3xl font-bold text-green-800">{t.disponibles}</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-600">Prestadas</p>
            <p className="text-3xl font-bold text-blue-800">{t.prestadas}</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm text-red-600">Perdidas</p>
            <p className="text-3xl font-bold text-red-800">{t.perdidas}</p>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left">Categoría</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-right">Disponibles</th>
                <th className="px-4 py-3 text-right">Prestadas</th>
                <th className="px-4 py-3 text-right">Perdidas</th>
                <th className="px-4 py-3 text-right">Mantenimiento</th>
                <th className="px-4 py-3 text-right">% Disponible</th>
              </tr>
            </thead>
            <tbody>
              {result.rows.map((row, i) => (
                <tr key={i} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{row.category}</td>
                  <td className="px-4 py-3 text-right">{row.total_copias}</td>
                  <td className="px-4 py-3 text-right text-green-700 font-semibold">
                    {row.disponibles}
                  </td>
                  <td className="px-4 py-3 text-right text-blue-700">{row.prestadas}</td>
                  <td className="px-4 py-3 text-right text-red-700">{row.perdidas}</td>
                  <td className="px-4 py-3 text-right text-yellow-700">{row.en_mantenimiento}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      Number(row.porcentaje_disponible) >= 60
                        ? 'bg-green-100 text-green-700'
                        : Number(row.porcentaje_disponible) >= 30
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {row.porcentaje_disponible}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}