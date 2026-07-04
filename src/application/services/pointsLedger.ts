import { collections } from "../../domain/collections";
import { calculateLevel } from "../../domain/services/pointsPolicy";

async function applyPointMovement(db, { usuarioId, referenciaId, tipoReferencia, puntos, motivo, now = new Date() }) {
  await db.collection(collections.pointMovements).insertOne({
    usuarioId,
    referenciaId,
    tipoReferencia,
    puntos,
    motivo,
    fechaMovimiento: now
  });

  await db.collection(collections.users).updateOne(
    { _id: usuarioId },
    { $inc: { puntosTotales: puntos } }
  );

  const user = await db.collection(collections.users).findOne({ _id: usuarioId });
  if (user) {
    await db.collection(collections.users).updateOne(
      { _id: usuarioId },
      { $set: { nivel: calculateLevel(user.puntosTotales || 0) } }
    );
  }
}

export { applyPointMovement };

