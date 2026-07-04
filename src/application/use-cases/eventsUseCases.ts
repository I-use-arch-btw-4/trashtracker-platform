import { collections } from "../../domain/collections";
import { buildCleanupEvent, buildCleanupEventPatch, buildAttendee, buildEvidence } from "../../domain/models/cleanupEvent";
import { pointReasons } from "../../domain/services/pointsPolicy";
import { applyPointMovement } from "../services/pointsLedger";
import { AppError } from "../../shared/errors/AppError";
import { toObjectId } from "../../shared/mongodb/objectId";

function createEventsUseCases({ db, repositories }) {
  async function ensureUserExists(usuarioId) {
    const user = await repositories.users.findById(usuarioId);
    if (!user) throw new AppError(404, "Usuario relacionado no encontrado.");
  }

  async function ensureCommunityExists(comunidadId) {
    const community = await repositories.communities.findById(comunidadId);
    if (!community) throw new AppError(404, "Comunidad relacionada no encontrada.");
  }

  async function listEvents({ pagination, query }) {
    const filter: Record<string, any> = {};
    if (query.estado) filter.estado = query.estado;
    if (query.comunidadId) filter.comunidadId = toObjectId(query.comunidadId, "comunidadId");

    return repositories.cleanupEvents.list({
      filter,
      sort: { fechaEvento: -1 },
      skip: pagination.skip,
      limit: pagination.limit
    });
  }

  async function getEvent(id) {
    const event = await repositories.cleanupEvents.findById(toObjectId(id));
    if (!event) throw new AppError(404, "Evento no encontrado.");
    return event;
  }

  async function createEvent(payload) {
    const event = buildCleanupEvent(payload);
    await ensureCommunityExists(event.comunidadId);
    await ensureUserExists(event.organizadorId);

    const created = await repositories.cleanupEvents.create(event);

    await applyPointMovement(db, {
      usuarioId: event.organizadorId,
      referenciaId: created._id,
      tipoReferencia: "evento",
      puntos: pointReasons.eventOrganized.points,
      motivo: pointReasons.eventOrganized.reason
    });

    return created;
  }

  async function updateEvent(id, payload) {
    const patch = buildCleanupEventPatch(payload);
    if (patch.comunidadId) await ensureCommunityExists(patch.comunidadId);
    if (patch.organizadorId) await ensureUserExists(patch.organizadorId);

    const event = await repositories.cleanupEvents.updateById(toObjectId(id), patch);
    if (!event) throw new AppError(404, "Evento no encontrado.");
    return event;
  }

  async function deleteEvent(id) {
    const event = await repositories.cleanupEvents.deleteById(toObjectId(id));
    if (!event) throw new AppError(404, "Evento no encontrado.");
    return event;
  }

  async function addAttendee(id, payload) {
    const eventId = toObjectId(id);
    const attendee = buildAttendee(payload);
    await ensureUserExists(attendee.usuarioId);

    const event = await repositories.cleanupEvents.findById(eventId);
    if (!event) throw new AppError(404, "Evento no encontrado.");

    const alreadyAttendee = (event.asistentes || []).some((item) =>
      String(item.usuarioId) === String(attendee.usuarioId)
    );
    if (alreadyAttendee) throw new AppError(409, "El usuario ya confirmo asistencia.");

    const update = await db.collection(collections.cleanupEvents).findOneAndUpdate(
      { _id: eventId },
      { $push: { asistentes: attendee } },
      { returnDocument: "after" }
    );

    await applyPointMovement(db, {
      usuarioId: attendee.usuarioId,
      referenciaId: eventId,
      tipoReferencia: "evento",
      puntos: pointReasons.eventAttendance.points,
      motivo: pointReasons.eventAttendance.reason
    });

    return update;
  }

  async function addEvidence(id, payload) {
    const eventId = toObjectId(id);
    const evidence = buildEvidence(payload);
    await ensureUserExists(evidence.usuarioId);

    const update = await db.collection(collections.cleanupEvents).findOneAndUpdate(
      { _id: eventId },
      { $push: { evidenciasResultado: evidence } },
      { returnDocument: "after" }
    );

    if (!update) throw new AppError(404, "Evento no encontrado.");
    return update;
  }

  return {
    listEvents,
    getEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    addAttendee,
    addEvidence
  };
}

export { createEventsUseCases };

