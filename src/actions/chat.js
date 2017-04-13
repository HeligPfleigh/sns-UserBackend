/* eslint-disable import/prefer-default-export */

import {
  CONTROL_NEW_CONVERSATION,
  ADD_USER_NEW_CONVERSATION,
  CHAT_ACTIVE_CONVERSATION,
  CHAT_ON_CONVERSATION_CHILD_ADD,
  CHAT_ON_FAIL,
 }
 from '../constants';

export function makeError(error) {
  return {
    type: CHAT_ON_FAIL,
    error,
  };
}
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
      dispatch({
        type: ADD_USER_NEW_CONVERSATION,
        error,
      });
    }
  };
}

export function sendMessage({ message, to, conversation }) {
  return async (dispatch, getState, { chat }) => {
    try {
      const conversationId = await chat.sendMessage({ from: chat.user, to, conversation, message });
      if (!conversation && conversationId) {
        dispatch({
          type: CHAT_ACTIVE_CONVERSATION,
          payload: {
            id: conversationId,
          },
        });
      }
    } catch (error) {
      makeError(error);
    }
  };
}

export function activeConversation({ conversation }) {
  return async (dispatch, getState, { chat }) => {
    try {
      if (!conversation) {
        dispatch({
          type: CHAT_ACTIVE_CONVERSATION,
          payload: {
            id: conversation,
          },
        });
        chat.onMessage(conversation, (error, data) => {
          if (error) {
            dispatch({
              type: CHAT_ON_FAIL,
              error,
            });
          } else {

          }
        });
      }
    } catch (error) {
      makeError(error);
    }
  };
}

export function getConversations() {
  return async (dispatch, getState, { chat }) => {
    try {
      chat.onConversation((err, data) => {
        if (err) {
          makeError(err);
        } else {
          dispatch({
            type: CHAT_ON_CONVERSATION_CHILD_ADD,
            payload: data,
          });
        }
      });
    } catch (error) {
      makeError(error);
    }
  };
}
