function parsePagination(query) {
  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 20), 1), 100);
  return {
    page,
    limit,
    skip: (page - 1) * limit
  };
}

function paginatedResponse({ items, total, page, limit }) {
  return {
    data: items,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
}

export { parsePagination, paginatedResponse };

