import filter from './queryFilters';

const find = state => ({
  _getSelect(select) {
    if (Array.isArray(select)) {
      const result = {};
      select.forEach((name) => {
        result[name] = 1;
      });
      return result;
    }

    return select;
  },
  _findBySkip(params, count, getFilter = filter) {
    // Start with finding all, and limit when necessary.
    const { filters, query } = getFilter(params.query || {});
    let q = state.Model.find(query);

    if (filters.$select) {
      q = state.Model.find(query, this._getSelect(filters.$select));
    }

    if (filters.$sort) {
      q.sort(filters.$sort);
    }

    if (params.collation) {
      // https://docs.mongodb.com/manual/reference/collation/
      q.collation(params.collation);
    }

    if (filters.$limit) {
      q.limit(filters.$limit);
    }

    if (filters.$skip) {
      q.skip(filters.$skip);
    }
    q = q.cursor();

    const data = new Promise((resolve, reject) => {
      const edgesArray = [];
      q.on('data', async (res) => {
        edgesArray.push(res);
      });

      q.on('error', (err) => {
        reject(err);
      });

      q.on('end', () => {
        resolve(edgesArray);
      });
    });

    if (!count) {
      return Promise.all([data]).then(values => ({
        paging: {
          total: null,
          limit: filters.$limit,
          skip: filters.$skip || 0,
        },
        data: values[0],
      }));
    }
    const total = state.Model.count(query);
    return Promise.all([data, total]).then(values => ({
      paging: {
        total: values[1],
        limit: filters.$limit,
        skip: filters.$skip || 0,
      },
      data: values[0],
    }));
  },

  _findByCursor(field, cursor, params, count, getFilter = filter) {
    const { filters, query } = getFilter(params.query || {});
    let rootQuery = {};
    if (cursor) {
      rootQuery = Object.assign({}, {
        [field]: {
          $lt: cursor,
        },
      }, query);
    } else {
      rootQuery = Object.assign({}, query);
    }
    let q = state.Model.find(rootQuery);

    if (filters.$select) {
      q = state.Model.find(rootQuery, this._getSelect(filters.$select));
    }

    if (filters.$limit) {
      q = q.limit(filters.$limit);
    }

    if (filters.$sort) {
      q = q.sort(filters.$sort);
    }

    if (params.collation) {
      // https://docs.mongodb.com/manual/reference/collation/
      q = q.collation(params.collation);
    }

    q = q.cursor();
    const data = new Promise((resolve, reject) => {
      const edgesArray = [];
      q.on('data', async (res) => {
        edgesArray.push(res);
      });

      q.on('error', (err) => {
        reject(err);
      });

      q.on('end', () => {
        resolve(edgesArray);
      });
    });

    if (!count) {
      return Promise.all([data]).then(values => ({
        paging: {
          total: null,
          limit: filters.$limit,
        },
        data: values[0],
      }));
    }
    const total = state.Model.count(query);
    return Promise.all([data, total]).then(async (values) => {
      const endCursor = values[0].length > 0 ? (values[0][values[0].length - 1])._id : null;
      const hasNextPageFlag = new Promise((resolve, reject) => {
        if (endCursor) {
          const endQuery = Object.assign({}, {
            [field]: {
              $lt: endCursor,
            },
          }, query);
          state.Model.find(endQuery).count((err, tcount) => {
            if (err) reject(err);
            (tcount > 0) ? resolve(true) : resolve(false);
          });
        } else {
          resolve(false);
        }
      });
      return {
        paging: {
          total: values[1],
          limit: filters.$limit,
          endCursor,
          hasNextPage: await hasNextPageFlag,
        },
        data: values[0],
      };
    });
  },

  find(params) {
    const paginate = (params && typeof params.paginate !== 'undefined') ? params.paginate : state.paginate;
    let result = null;
    if (state.cursor !== true) {
      result = this._findBySkip(params, !!paginate.default,
        query => filter(query, paginate),
      );
    } else {
      const field = (params && typeof params.field !== 'undefined') ? params.field : '_id';
      const cursor = (params && typeof params.$cursor !== 'undefined') ? params.$cursor : null;
      result = this._findByCursor(field, cursor, params, !!paginate.default,
        query => filter(query, paginate),
      );
    }
    if (!paginate.default) {
      return result.then(page => page.data);
    }
    return result;
  },
});

export default find;
