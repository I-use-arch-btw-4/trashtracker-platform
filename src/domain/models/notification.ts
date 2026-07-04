import { z } from "zod";
import { toObjectId, toOptionalObjectId } from "../../shared/mongodb/objectId";
import { validate } from "../validation";

const notificationTypes = ["reporte", "evento", "recompensa", "sistema"] as const;

const createNotificationSchema = z.object({
  usuarioId: z.string().min(1),
  tipo: z.enum(notificationTypes).default("sistema"),
  titulo: z.string().min(3).max(160),
  mensaje: z.string().min(3).max(700),
  referenciaId: z.string().optional()
});

function buildNotification(input, now = new Date()) {
  const data = validate(createNotificationSchema, input);

  return {
    usuarioId: toObjectId(data.usuarioId, "usuarioId"),
    tipo: data.tipo,
    titulo: data.titulo,
    mensaje: data.mensaje,
    referenciaId: toOptionalObjectId(data.referenciaId, "referenciaId"),
    leida: false,
    fechaEnvio: now
  };
}

export { buildNotification, notificationTypes };

