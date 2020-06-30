function parseRequestParams(req, res, next) {
  try {
    const params = req.query

    params.filters = params.filters ? JSON.parse(params.filters) : {}
    params.sort = params.sort ? JSON.parse(params.sort) : {}

    if (params.search) {
      const search = JSON.parse(params.search)
      if (
        !('value' in search) ||
        !('scope' in search) ||
        search.scope.length < 1
      ) {
        throw new Error(
          'search expected a json string like: { value: value, scope: [scope1, scope2] }!'
        )
      }

      const searchFilters = []

      const reg = {
        $regex: new RegExp(decodeURIComponent(search.value), 'i')
      }

      for (const scope of search.scope) {
        searchFilters.push({
          [scope]: reg
        })
      }

      params.filters = {
        ...params.filters,
        $or: searchFilters
      }
    }
    next()
  } catch (e) {
    throw e
  }
}

function cors() {
  const _cors = require('cors')
  return process.env.NODE_ENV === 'development' ? _cors() : (req, res, next) => { next() }
}

module.exports = {
  parseRequestParams,
  cors: cors()
}
