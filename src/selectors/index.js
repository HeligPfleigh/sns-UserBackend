/**
 * Homepage selectors
 */

import { createSelector } from 'reselect';

const getState = (store) => store.getState();
const selectUser = createSelector(
  getState,
  (state) => state.user
);

export {
  selectUser,
};
