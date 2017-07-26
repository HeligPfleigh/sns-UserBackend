export const roles = ['superadmin', 'admin', 'user', 'guest'];
export const permissions = {
  user: ['create', 'delete'],
  password: ['change', 'forgot'],
  rbac: ['update'],
  post: ['create', 'update', 'delete'],
};
export const grants = {
  guest: ['create_user', 'forgot_password'],
  user: ['change_password', 'create_post', 'update_post', 'delete_post'],
  admin: ['user', 'delete_user', 'update_rbac'], // with user permission
  superadmin: ['admin'], // with admin permission
};
