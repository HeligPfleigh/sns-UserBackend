import { combineReducers } from 'redux';
import user from './user';
import chat from './chat';
import runtime from './runtime';

export default function createRootReducer({ apolloClient }) {
  return combineReducers({
    apollo: apolloClient.reducer(),
    user,
    chat,
    runtime,
  });
}
