import { buildStore, buildStorePatch } from "../../domain/models/store";
import { AppError } from "../../shared/errors/AppError";
import { toObjectId } from "../../shared/mongodb/objectId";

function createStoresUseCases({ repositories }) {
  async function listStores({ pagination, query }) {
    const filter: Record<string, any> = {};
    if (query.distrito) filter.distrito = query.distrito;
    if (query.estado) filter.estado = query.estado;

    return repositories.stores.list({
      filter,
      sort: { nombre: 1 },
      skip: pagination.skip,
      limit: pagination.limit
    });
  }

  async function getStore(id) {
    const store = await repositories.stores.findById(toObjectId(id));
    if (!store) throw new AppError(404, "Comercio no encontrado.");
    return store;
  }

  async function createStore(payload) {
    return repositories.stores.create(buildStore(payload));
  }

  async function updateStore(id, payload) {
    const store = await repositories.stores.updateById(toObjectId(id), buildStorePatch(payload));
    if (!store) throw new AppError(404, "Comercio no encontrado.");
    return store;
  }

  async function deleteStore(id) {
    const store = await repositories.stores.deleteById(toObjectId(id));
    if (!store) throw new AppError(404, "Comercio no encontrado.");
    return store;
  }

  return { listStores, getStore, createStore, updateStore, deleteStore };
}

export { createStoresUseCases };

