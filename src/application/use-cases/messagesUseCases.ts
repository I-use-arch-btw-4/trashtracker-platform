import { collections } from "../../domain/collections";
import { buildCommunityMessage, buildCommunityMessagePatch, buildMessageReaction } from "../../domain/models/communityMessage";
import { AppError } from "../../shared/errors/AppError";
import { toObjectId } from "../../shared/mongodb/objectId";

function createMessagesUseCases({ db, repositories }) {
  async function ensureCommunityExists(comunidadId) {
    const community = await repositories.communities.findById(comunidadId);
    if (!community) throw new AppError(404, "Comunidad relacionada no encontrada.");
  }

  async function ensureUserExists(usuarioId) {
    const user = await repositories.users.findById(usuarioId);
    if (!user) throw new AppError(404, "Usuario relacionado no encontrado.");
  }

  async function listMessages({ pagination, query }) {
    const filter: Record<string, any> = {};
    if (query.comunidadId) filter.comunidadId = toObjectId(query.comunidadId, "comunidadId");
    if (query.estado) filter.estado = query.estado;

    return repositories.communityMessages.list({
      filter,
      sort: { fechaEnvio: -1 },
      skip: pagination.skip,
      limit: pagination.limit
    });
  }

  async function getMessage(id) {
    const message = await repositories.communityMessages.findById(toObjectId(id));
    if (!message) throw new AppError(404, "Mensaje no encontrado.");
    return message;
  }

  async function createMessage(payload) {
    const message = buildCommunityMessage(payload);
    await ensureCommunityExists(message.comunidadId);
    await ensureUserExists(message.usuarioId);
    return repositories.communityMessages.create(message);
  }

  async function updateMessage(id, payload) {
    const patch = buildCommunityMessagePatch(payload);
    if (patch.comunidadId) await ensureCommunityExists(patch.comunidadId);
    if (patch.usuarioId) await ensureUserExists(patch.usuarioId);

    const message = await repositories.communityMessages.updateById(toObjectId(id), patch);
    if (!message) throw new AppError(404, "Mensaje no encontrado.");
    return message;
  }

  async function deleteMessage(id) {
    const message = await repositories.communityMessages.deleteById(toObjectId(id));
    if (!message) throw new AppError(404, "Mensaje no encontrado.");
    return message;
  }

  async function addReaction(id, payload) {
    const messageId = toObjectId(id);
    const reaction = buildMessageReaction(payload);
    await ensureUserExists(reaction.usuarioId);

    const update = await db.collection(collections.communityMessages).findOneAndUpdate(
      { _id: messageId },
      { $push: { reacciones: reaction } },
      { returnDocument: "after" }
    );

    if (!update) throw new AppError(404, "Mensaje no encontrado.");
    return update;
  }

  return {
    listMessages,
    getMessage,
    createMessage,
    updateMessage,
    deleteMessage,
    addReaction
  };
}

export { createMessagesUseCases };

