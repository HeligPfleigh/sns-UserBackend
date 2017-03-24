/**
 * Homepage selectors
 */
/* eslint-disable import/prefer-default-export*/

import { createSelector } from 'reselect';

const getState = store => store.getState();
const selectUser = createSelector(
  getState,
  state => state.user,
);

export {
  selectUser,
};

/* eslint-enable import/prefer-default-export*/
