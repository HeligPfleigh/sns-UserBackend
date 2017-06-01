import find from './find';

const Service = (options) => {
  if (!options) {
    throw new Error('MongoDB options have to be provided');
  }
  const state = {
    Model: options.Model,
    id: options.id || '_id',
    events: options.events || [],
    paginate: options.paginate || {},
    cursor: options.cursor || false,
  };

  return Object.assign({}, find(state));
};

export default Service;

/**
code style:

Service({
  Model: db.collection('messages'),
  paginate: {
    default: 2,
    max: 4
  }
})
 */
