/* eslint-disable import/prefer-default-export */

import {
  CONTROL_NEW_CONVERSATION,
  ADD_USER_NEW_CONVERSATION,
 }
 from '../constants';

export function activeNewChat(status) {
  return {
    type: CONTROL_NEW_CONVERSATION,
    payload: {
      active: status,
    },
  };
}
export function addNewUserToConversation({ userChatId }) {
  return async (dispatch, getState, { chat }) => {
    try {
      const payload = await chat.getUser(userChatId);
      dispatch({
        type: ADD_USER_NEW_CONVERSATION,
        payload,
      });
    } catch (error) {
      console.error(error); //eslint-disable-line
    }
  };
}

export function sendMessage({ message, to, conversation, isNew }) {
  return async (dispatch, getState, { chat }) => {
    try {
      if (!conversation) {
        chat.sendMessage({ from: chat.user, to, isNew, message });
      }
    } catch (error) {
      console.error(error); //eslint-disable-line
    }
  };
}
