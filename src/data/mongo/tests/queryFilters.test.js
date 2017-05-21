import filter from '../queryFilters';

describe('$sort', () => {
  it('returns $sort when present in query', () => {
    const { filters, query } = filter({ $sort: { name: 1 } });
    expect(filters.$sort.name).toBe(1);
    expect(query).toEqual({});
  });

  it('returns $sort when present in query as an object', () => {
    const { filters, query } = filter({ $sort: { name: { something: 10 } } });
    expect(filters.$sort.name.something).toBe(10);
    expect(query).toEqual({});
  });

  it('converts strings in $sort', () => {
    const { filters, query } = filter({ $sort: { test: '-1' } });
    expect(filters.$sort.test).toBe(-1);
    expect(query).toEqual({});
  });

  it('returns undefined when not present in query', () => {
    const query = { $foo: 1 };
    const { filters } = filter(query);
    expect(filters.$sort).toBe(undefined);
  });
});


describe('$limit', () => {
  let rootQuery = { $limit: 1 };
  beforeEach(() => {
    rootQuery = { $limit: 1 };
  });

  it('returns $limit when present in query', () => {
    const { filters, query } = filter(rootQuery);
    expect(filters.$limit).toBe(1);
    expect(query).toEqual({});
  });

  it('returns undefined when not present in query', () => {
    const query = { $foo: 1 };
    const { filters } = filter(query);
    expect(filters.$limit).toBe(undefined);
  });

  it('removes $limit from query when present', () => {
    expect(filter(rootQuery).query).toEqual({});
  });

  it('parses $limit strings into integers (#4)', () => {
    const { filters } = filter({ $limit: '2' });
    expect(filters.$limit).toBe(2);
  });

  it('allows $limit 0', () => {
    const { filters } = filter({ $limit: 0 }, { default: 10 });
    expect(filters.$limit).toBe(0);
  });

  describe('pagination', () => {
    it('limits with default pagination', () => {
      const { filters } = filter({}, { default: 10 });
      expect(filters.$limit).toBe(10);
    });

    it('limits with max pagination', () => {
      const { filters } = filter({ $limit: 20 }, { default: 5, max: 10 });
      const { filters: filtersNeg } = filter({ $limit: -20 }, { default: 5, max: 10 });
      expect(filters.$limit).toBe(10);
      expect(filtersNeg.$limit).toBe(10);
    });
  });
});

describe('$skip', () => {
  let rootQuery = { $skip: 1 };
  beforeEach(() => {
    rootQuery = { $skip: 1 };
  });

  it('returns $skip when present in query', () => {
    const { filters } = filter(rootQuery);
    expect(filters.$skip).toBe(1);
  });

  it('removes $skip from query when present', () => {
    expect(filter(rootQuery).query).toEqual({});
  });

  it('returns undefined when not present in query', () => {
    const query = { $foo: 1 };
    const { filters } = filter(query);
    expect(filters.$skip).toBe(undefined);
  });

  it('parses $skip strings into integers (#4)', () => {
    const { filters } = filter({ $skip: '33' });
    expect(filters.$skip).toBe(33);
  });
});

describe('$select', () => {
  let rootQuery = { $select: 1 };
  beforeEach(() => {
    rootQuery = { $select: 1 };
  });

  it('returns $select when present in query', () => {
    const { filters } = filter(rootQuery);
    expect(filters.$select).toBe(1);
  });

  it('removes $select from query when present', () => {
    expect(filter(rootQuery).query).toEqual({});
  });

  it('returns undefined when not present in query', () => {
    const query = { $foo: 1 };
    const { filters } = filter(query);
    expect(filters.$select).toBe(undefined);
  });
});

describe('$populate', () => {
  let rootQuery = { $populate: 1 };
  beforeEach(() => {
    rootQuery = { $populate: 1 };
  });

  it('returns $populate when present in query', () => {
    const { filters } = filter(rootQuery);
    expect(filters.$populate).toBe(1);
  });

  it('removes $populate from query when present', () => {
    expect(filter(rootQuery).query).toEqual({});
  });

  it('returns undefined when not present in query', () => {
    const query = { $foo: 1 };
    const { filters } = filter(query);
    expect(filters.$populate).toBe(undefined);
  });
});
