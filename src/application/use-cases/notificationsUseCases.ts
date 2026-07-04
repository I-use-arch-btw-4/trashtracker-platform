import { buildNotification } from "../../domain/models/notification";
import { AppError } from "../../shared/errors/AppError";
import { toObjectId } from "../../shared/mongodb/objectId";

function createNotificationsUseCases({ repositories }) {
  async function listNotifications({ pagination, query }) {
    const filter: Record<string, any> = {};
    if (query.usuarioId) filter.usuarioId = toObjectId(query.usuarioId, "usuarioId");
    if (query.leida !== undefined) filter.leida = query.leida === "true";

    return repositories.notifications.list({
      filter,
      sort: { fechaEnvio: -1 },
      skip: pagination.skip,
      limit: pagination.limit
    });
  }

  async function getNotification(id) {
    const notification = await repositories.notifications.findById(toObjectId(id));
    if (!notification) throw new AppError(404, "Notificacion no encontrada.");
    return notification;
  }

  async function createNotification(payload) {
    return repositories.notifications.create(buildNotification(payload));
  }

  async function markAsRead(id) {
    const notification = await repositories.notifications.updateById(
      toObjectId(id),
      { leida: true, fechaLectura: new Date() }
    );
    if (!notification) throw new AppError(404, "Notificacion no encontrada.");
    return notification;
  }

  async function deleteNotification(id) {
    const notification = await repositories.notifications.deleteById(toObjectId(id));
    if (!notification) throw new AppError(404, "Notificacion no encontrada.");
    return notification;
  }

  return {
    listNotifications,
    getNotification,
    createNotification,
    markAsRead,
    deleteNotification
  };
}

export { createNotificationsUseCases };

