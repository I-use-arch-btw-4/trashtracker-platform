import { buildUser, buildUserPatch } from "../../domain/models/user";
import { AppError } from "../../shared/errors/AppError";
import { toObjectId } from "../../shared/mongodb/objectId";

function createUsersUseCases({ repositories }) {
  async function listUsers({ pagination, query }) {
    const filter: Record<string, any> = {};
    if (query.distrito) filter.distrito = query.distrito;
    if (query.rol) filter.rol = query.rol;
    if (query.estadoCuenta) filter.estadoCuenta = query.estadoCuenta;

    return repositories.users.list({
      filter,
      sort: { fechaRegistro: -1 },
      skip: pagination.skip,
      limit: pagination.limit
    });
  }

  async function getUser(id) {
    const user = await repositories.users.findById(toObjectId(id));
    if (!user) throw new AppError(404, "Usuario no encontrado.");
    return user;
  }

  async function createUser(payload) {
    return repositories.users.create(buildUser(payload));
  }

  async function updateUser(id, payload) {
    const patch = buildUserPatch(payload);
    const user = await repositories.users.updateById(toObjectId(id), patch);
    if (!user) throw new AppError(404, "Usuario no encontrado.");
    return user;
  }

  async function deleteUser(id) {
    const user = await repositories.users.deleteById(toObjectId(id));
    if (!user) throw new AppError(404, "Usuario no encontrado.");
    return user;
  }

  return { listUsers, getUser, createUser, updateUser, deleteUser };
}

export { createUsersUseCases };

