import RBAC from 'rbac';
import get from 'lodash/get';
import {
  roles,
  permissions,
  grants,
} from '../constants/rbac';

const rbac = new RBAC({
  roles,
  permissions,
  grants,
});

/**
// can
rbac.can('user', 'change', 'password', (err, data)=> {
  console.log('can', 'user', 'change', 'password', err, data);
});
rbac.can('user', 'create', 'user', (err, data)=> {
  console.log('can', 'user', 'create', 'user', err, data);
});

// can any
rbac.canAny('admin', [['delete', 'user']], (err, data)=> {
  console.log('canAny', 'admin', [['delete', 'user']], err, data);
});
rbac.canAny('user', [['create', 'user']], (err, data)=> {
  console.log('canAny', 'user', [['create', 'user']], err, data);
});

// can all
rbac.canAll('admin', [['delete', 'user']], (err, data)=> {
  console.log('canAll', 'admin', [['delete', 'user']], err, data);
});
rbac.canAll('user', [['create', 'user']], (err, data)=> {
  console.log('canAll', 'user', [['create', 'user']], err, data);
});

// hasRole
*/

export const everyone = (target, key, descriptor) => ({
  ...descriptor,
  value: function process(obj, args, context, info) {
    return descriptor.value.apply(this, [obj, args, context, info]);
  },
});

export const authenticated = (target, key, descriptor) => ({
  ...descriptor,
  value: function process(obj, args, context, info) {
    if (!context.user) {
      throw new Error('you have not authority to access this data');
    }
    return descriptor.value.apply(this, [obj, args, context, info]);
  },
});

export const isRole = () => {
  throw new Error('not implement yet');
};

export const relation = () => {
  throw new Error('not implement yet');
};

export const can = (action, resource) => ((target, key, descriptor) => ({
  ...descriptor,
  value: function process(obj, args, context, info) {
    const { user } = context;
    return new Promise((resolve, reject) => {
      rbac.can(user.roles[0], action, resource, (err, data) => {
        if (err) {
          return reject(err);
        }
        if (!data) {
          return reject(new Error(`you dont have permission to ${action} ${resource}`));
        }
        return resolve(descriptor.value.apply(this, [obj, args, context, info]));
      });
    });
  },
}));

export const onlyMe = (field = '_id') => ((target, key, descriptor) => ({
  ...descriptor,
  value: function process(obj, args, context, info) {
    const { user } = context;
    if (user.id !== get(obj, field)) {
      throw new Error(`you dont have permission to access ${key}`);
    }
    return descriptor.value.apply(this, [obj, args, context, info]);
  },
}));

// NOTE: not working on root query
export const friend = (target, key, descriptor) => ({
  ...descriptor,
  value: function process(obj, args, context, info) {
    throw new Error('not implement yet');
    // return descriptor.value.apply(this, [obj, args, context, info]);
  },
});

export const building = (target, key, descriptor) => ({
  ...descriptor,
  value: function process(obj, args, context, info) {
    console.log(obj, context, 'building');
    return descriptor.value.apply(this, [obj, args, context, info]);
  },
});

export default {
  everyone,
  authenticated,
  isRole, // not
  relation, // not
  can,
  onlyMe,
  friend, // not
  building,
};
