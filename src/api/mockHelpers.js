/**
 * Simulates a network delay for mock API calls.
 */
const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

/**
 * Wraps mock data in a paginated response shape.
 */
export function paginate(items, page = 1, limit = 10) {
  const start = (page - 1) * limit;
  const data = items.slice(start, start + limit);
  return {
    data,
    meta: {
      total: items.length,
      page,
      limit,
      totalPages: Math.ceil(items.length / limit),
    },
  };
}

export { delay };
