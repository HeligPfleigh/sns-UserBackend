export default role => (route) => {
  const newRoute = {
    ...route,
    async action(param) {
      const { store } = param;
      const state = store.getState();
      if (!state.user || !state.user.roles || state.user.roles.length < 0
          || state.user.roles.indexOf(role) < 0) {
        return {
          redirect: '/login',
        };
      }
      const result = await route.action(param);
      return result;
    },
  };
  return newRoute;
};
export const requireAuth = (route) => {
  const newRoute = {
    ...route,
    async action(param) {
      const { store } = param;
      const state = store.getState();
      if (!state.user || !state.user.id) {
        return {
          redirect: '/login',
        };
      }
      const result = await route.action(param);
      return result;
    },
  };
  return newRoute;
};
