function getPagination(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 8));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

function paginatedResponse(rows, page, limit, total) {
  return {
    success: true,
    data: rows,
    pagination: {
      page,
      limit,
      totalRegistros: total,
      totalPaginas: Math.ceil(total / limit),
    },
  };
}

module.exports = { getPagination, paginatedResponse };
