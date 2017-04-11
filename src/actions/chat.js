/* eslint-disable import/prefer-default-export */

import { CONTROL_NEW_CONVERSATION } from '../constants';

export function activeNewChat(status) {
  return {
    type: CONTROL_NEW_CONVERSATION,
    payload: {
      active: status,
    },
  };
}
