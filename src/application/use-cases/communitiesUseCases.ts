import { collections } from "../../domain/collections";
import { buildCommunity, buildCommunityPatch, buildCommunityMember } from "../../domain/models/community";
import { AppError } from "../../shared/errors/AppError";
import { toObjectId } from "../../shared/mongodb/objectId";

function createCommunitiesUseCases({ db, repositories }) {
  async function ensureUserExists(usuarioId) {
    const user = await repositories.users.findById(usuarioId);
    if (!user) throw new AppError(404, "Usuario relacionado no encontrado.");
  }

  async function listCommunities({ pagination, query }) {
    const filter: Record<string, any> = {};
    if (query.distrito) filter.distrito = query.distrito;
    if (query.estado) filter.estado = query.estado;

    return repositories.communities.list({
      filter,
      sort: { fechaCreacion: -1 },
      skip: pagination.skip,
      limit: pagination.limit
    });
  }

  async function getCommunity(id) {
    const community = await repositories.communities.findById(toObjectId(id));
    if (!community) throw new AppError(404, "Comunidad no encontrada.");
    return community;
  }

  async function createCommunity(payload) {
    const community = buildCommunity(payload);
    await ensureUserExists(community.liderId);
    return repositories.communities.create(community);
  }

  async function updateCommunity(id, payload) {
    const patch = buildCommunityPatch(payload);
    if (patch.liderId) await ensureUserExists(patch.liderId);

    const community = await repositories.communities.updateById(toObjectId(id), patch);
    if (!community) throw new AppError(404, "Comunidad no encontrada.");
    return community;
  }

  async function deleteCommunity(id) {
    const community = await repositories.communities.deleteById(toObjectId(id));
    if (!community) throw new AppError(404, "Comunidad no encontrada.");
    return community;
  }

  async function addMember(id, payload) {
    const communityId = toObjectId(id);
    const member = buildCommunityMember(payload);
    await ensureUserExists(member.usuarioId);

    const community = await repositories.communities.findById(communityId);
    if (!community) throw new AppError(404, "Comunidad no encontrada.");

    const alreadyMember = (community.miembros || []).some((item) =>
      String(item.usuarioId) === String(member.usuarioId)
    );
    if (alreadyMember) throw new AppError(409, "El usuario ya pertenece a la comunidad.");

    const update = await db.collection(collections.communities).findOneAndUpdate(
      { _id: communityId },
      { $push: { miembros: member } },
      { returnDocument: "after" }
    );

    return update;
  }

  return {
    listCommunities,
    getCommunity,
    createCommunity,
    updateCommunity,
    deleteCommunity,
    addMember
  };
}

export { createCommunitiesUseCases };

