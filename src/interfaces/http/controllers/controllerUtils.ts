import { parsePagination, paginatedResponse } from "../../../shared/http/pagination";

async function sendList(req, res, listUseCase) {
  const pagination = parsePagination(req.query);
  const { items, total } = await listUseCase({ pagination, query: req.query });
  res.json(paginatedResponse({
    items,
    total,
    page: pagination.page,
    limit: pagination.limit
  }));
}

function sendCreated(res, data) {
  res.status(201).json({ data });
}

function sendOk(res, data) {
  res.json({ data });
}

export { sendList, sendCreated, sendOk };

