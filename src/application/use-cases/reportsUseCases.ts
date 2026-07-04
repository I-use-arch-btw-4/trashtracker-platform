import { collections } from "../../domain/collections";
import { buildReport, buildReportPatch, buildComment, buildValidation, buildReaction } from "../../domain/models/report";
import { pointReasons } from "../../domain/services/pointsPolicy";
import { increasePriority } from "../../domain/services/reportPriorityService";
import { applyPointMovement } from "../services/pointsLedger";
import { AppError } from "../../shared/errors/AppError";
import { toObjectId } from "../../shared/mongodb/objectId";

function createReportsUseCases({ db, repositories }) {
  async function ensureUserExists(usuarioId) {
    const user = await repositories.users.findById(usuarioId);
    if (!user) throw new AppError(404, "Usuario relacionado no encontrado.");
    return user;
  }

  async function listReports({ pagination, query }) {
    const filter: Record<string, any> = {};
    if (query.distrito) filter.distrito = query.distrito;
    if (query.estado) filter.estado = query.estado;
    if (query.tipoResiduo) filter.tipoResiduo = query.tipoResiduo;

    return repositories.reports.list({
      filter,
      sort: { fechaReporte: -1 },
      skip: pagination.skip,
      limit: pagination.limit
    });
  }

  async function getReport(id) {
    const report = await repositories.reports.findById(toObjectId(id));
    if (!report) throw new AppError(404, "Reporte no encontrado.");
    return report;
  }

  async function createReport(payload) {
    const report = buildReport(payload);
    await ensureUserExists(report.usuarioId);
    const created = await repositories.reports.create(report);

    await applyPointMovement(db, {
      usuarioId: report.usuarioId,
      referenciaId: created._id,
      tipoReferencia: "reporte",
      puntos: pointReasons.reportCreated.points,
      motivo: pointReasons.reportCreated.reason
    });

    return created;
  }

  async function updateReport(id, payload) {
    const reportId = toObjectId(id);
    const patch = buildReportPatch(payload);
    patch.fechaActualizacion = new Date();

    if (patch.usuarioId) await ensureUserExists(patch.usuarioId);

    const report = await repositories.reports.updateById(reportId, patch);
    if (!report) throw new AppError(404, "Reporte no encontrado.");
    return report;
  }

  async function deleteReport(id) {
    const report = await repositories.reports.deleteById(toObjectId(id));
    if (!report) throw new AppError(404, "Reporte no encontrado.");
    return report;
  }

  async function addComment(reportIdValue, payload) {
    const reportId = toObjectId(reportIdValue);
    const comment = buildComment(payload);
    await ensureUserExists(comment.usuarioId);

    const update = await db.collection(collections.reports).findOneAndUpdate(
      { _id: reportId },
      {
        $push: { comentarios: comment },
        $set: { fechaActualizacion: new Date() }
      },
      { returnDocument: "after" }
    );

    if (!update) throw new AppError(404, "Reporte no encontrado.");

    await applyPointMovement(db, {
      usuarioId: comment.usuarioId,
      referenciaId: reportId,
      tipoReferencia: "comentario",
      puntos: pointReasons.reportCommented.points,
      motivo: pointReasons.reportCommented.reason
    });

    return update;
  }

  async function addValidation(reportIdValue, payload) {
    const reportId = toObjectId(reportIdValue);
    const validation = buildValidation(payload);
    await ensureUserExists(validation.usuarioId);

    const report = await repositories.reports.findById(reportId);
    if (!report) throw new AppError(404, "Reporte no encontrado.");

    const alreadyValidated = (report.validaciones || []).some((item) =>
      String(item.usuarioId) === String(validation.usuarioId)
    );
    if (alreadyValidated) {
      throw new AppError(409, "El usuario ya valido este reporte.");
    }

    const nextPriority = validation.tipo === "confirma"
      ? increasePriority(report.prioridad)
      : report.prioridad;

    const update = await db.collection(collections.reports).findOneAndUpdate(
      { _id: reportId },
      {
        $push: { validaciones: validation },
        $set: { prioridad: nextPriority, fechaActualizacion: new Date() }
      },
      { returnDocument: "after" }
    );

    await applyPointMovement(db, {
      usuarioId: validation.usuarioId,
      referenciaId: reportId,
      tipoReferencia: "validacion",
      puntos: pointReasons.reportValidated.points,
      motivo: pointReasons.reportValidated.reason
    });

    return update;
  }

  async function addReaction(reportIdValue, payload) {
    const reportId = toObjectId(reportIdValue);
    const reaction = buildReaction(payload);
    await ensureUserExists(reaction.usuarioId);

    const update = await db.collection(collections.reports).findOneAndUpdate(
      { _id: reportId },
      {
        $push: { reacciones: reaction },
        $set: { fechaActualizacion: new Date() }
      },
      { returnDocument: "after" }
    );

    if (!update) throw new AppError(404, "Reporte no encontrado.");
    return update;
  }

  return {
    listReports,
    getReport,
    createReport,
    updateReport,
    deleteReport,
    addComment,
    addValidation,
    addReaction
  };
}

export { createReportsUseCases };

