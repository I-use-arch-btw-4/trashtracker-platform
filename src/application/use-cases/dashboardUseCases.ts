import { collections } from "../../domain/collections";

function createDashboardUseCases({ db }) {
  async function getSummary() {
    const collectionNames = Object.values(collections) as string[];
    const counts: Record<string, number> = {};

    await Promise.all(collectionNames.map(async (name) => {
      counts[name] = await db.collection(name).countDocuments();
    }));

    const [reportsByDistrict, reportsByState, ranking] = await Promise.all([
      db.collection(collections.reports).aggregate([
        { $group: { _id: "$distrito", total: { $sum: 1 }, prioridadPromedio: { $avg: "$prioridad" } } },
        { $sort: { total: -1 } }
      ]).toArray(),
      db.collection(collections.reports).aggregate([
        { $group: { _id: "$estado", total: { $sum: 1 } } },
        { $sort: { total: -1 } }
      ]).toArray(),
      db.collection(collections.users).find(
        {},
        { projection: { nombre: 1, distrito: 1, rol: 1, puntosTotales: 1, nivel: 1 } }
      ).sort({ puntosTotales: -1 }).limit(5).toArray()
    ]);

    return {
      colecciones: counts,
      reportesPorDistrito: reportsByDistrict.map((item) => ({
        distrito: item._id,
        total: item.total,
        prioridadPromedio: Number((item.prioridadPromedio || 0).toFixed(2))
      })),
      reportesPorEstado: reportsByState.map((item) => ({
        estado: item._id,
        total: item.total
      })),
      rankingPuntos: ranking
    };
  }

  return { getSummary };
}

export { createDashboardUseCases };

