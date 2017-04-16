/* eslint-disable import/prefer-default-export */
import _ from 'lodash';
import * as firebase from 'firebase';
import {
  CHAT_SET_USER,
  CONTROL_NEW_CONVERSATION,
  ADD_USER_NEW_CONVERSATION,
  CHAT_ACTIVE_CONVERSATION,
  CHAT_ON_CONVERSATION_CHILD_ADD,
  CHAT_ON_MESSAGE_CHILD_ADD,
  CHAT_ON_FAIL,
 } from '../constants';

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
      const amOnline = chat.service.database().ref('/.info/connected');
      const userRef = chat.service.database().ref(`/online/${user.uid}`);
      amOnline.on('value', (snapshot) => {
        if (snapshot.val()) {
          userRef.onDisconnect().set(firebase.database.ServerValue.TIMESTAMP);
          userRef.set(true);
        }
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
export function addNewUserToConversation({ chatId }) {
  return async (dispatch, getState, { chat }) => {
    if (!chatId) return;
    try {
      const payload = await chat.getUser(chatId);
      if (payload && payload.uid) {
        const state = getState();
        const conversations = state && state.chat && state.chat.conversations;
        const exitsConversation = _.find(conversations, (conversation) => {
          const value = Object.values(conversation)[0];
          const receiver = value && value.receiver;
          if (receiver && receiver.uid === payload.uid) {
            return true;
          }
          return false;
        });
        if (exitsConversation) {
          dispatch(activeConversation({ conversation: exitsConversation }));
        } else {
          dispatch({
            type: ADD_USER_NEW_CONVERSATION,
            payload,
          });
        }
      }
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
