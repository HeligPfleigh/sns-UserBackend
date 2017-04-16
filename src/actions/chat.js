/* eslint-disable import/prefer-default-export */
import _ from 'lodash';
import {
  CHAT_SET_USER,
  CONTROL_NEW_CONVERSATION,
  ADD_USER_NEW_CONVERSATION,
  CHAT_ACTIVE_CONVERSATION,
  CHAT_ON_CONVERSATION_CHILD_ADD,
  CHAT_ON_MESSAGE_CHILD_ADD,
  CHAT_ON_FAIL,
 }
 from '../constants';

export function isLoad(state, conversationId) {
  if (conversationId) {
    return !_.isEmpty(state.chat && state.chat.messages && state.chat.messages[conversationId]);
  }
  return !_.isEmpty(state.chat && (state.chat.conversations || state.chat.messages));
}
export function auth(token) {
  return async (dispatch, getState, { chat }) => {
    const user = await chat.auth(token);
    if (user) {
      dispatch({
        type: CHAT_SET_USER,
        payload: user,
      });
    }
  };
}
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
export function addNewUserToConversation({ chatId }) {
  return async (dispatch, getState, { chat }) => {
    if (!chatId) return;
    try {
      const payload = await chat.getUser(chatId);
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

export function sendMessage({ message, to, conversationId }) {
  return async (dispatch, getState, { chat }) => {
    try {
      const resultId = await chat.sendMessage({ from: chat.user, to, conversationId, message });
      if (!conversationId && resultId) {
        dispatch({
          type: CHAT_ACTIVE_CONVERSATION,
          payload: {
            id: resultId,
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
      if (conversation) {
        const conversationId = Object.keys(conversation)[0];
        dispatch({
          type: CHAT_ACTIVE_CONVERSATION,
          payload: conversationId,
        });
        if (isLoad(getState(), conversationId)) return;
        chat.onMessage(conversationId, (error, data) => {
          if (error) {
            dispatch({
              type: CHAT_ON_FAIL,
              error,
            });
          } else {
            dispatch({
              type: CHAT_ON_MESSAGE_CHILD_ADD,
              payload: {
                conversationId,
                message: data,
              },
            });
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
      if (isLoad(getState())) return;
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
