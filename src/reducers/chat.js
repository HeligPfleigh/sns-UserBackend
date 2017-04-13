import {
  CONTROL_NEW_CONVERSATION,
  ADD_USER_NEW_CONVERSATION,
  CHAT_ACTIVE_CONVERSATION,
  CHAT_LOAD_CONVERSATION_HISTORY_SUCCESS,
  CHAT_ON_CONVERSATION_CHILD_ADD,
  CHAT_ON_FAIL,
} from '../constants';

const initialState = {
  new: {
    active: false,
  },
  conversations: [],
};
export default function chat(state = initialState, action) {
  const isNewConversation = state && state.new && state.new.active;
  switch (action.type) {
    case CONTROL_NEW_CONVERSATION:
      return {
        ...state,
        new: {
          active: action.payload.active,
        },
      };
    case ADD_USER_NEW_CONVERSATION:
      if (isNewConversation) {
        return {
          ...state,
          new: {
            active: true,
            receiver: action.payload,
          },
        };
      }
      return state;
    case CHAT_ACTIVE_CONVERSATION:
      return {
        ...state,
        new: {
          active: false,
        },
        current: action.payload.id,
      };
    case CHAT_LOAD_CONVERSATION_HISTORY_SUCCESS:
      return {
        ...state,
        conversations: state.conversations.concat(action.payload),
      };
    case CHAT_ON_CONVERSATION_CHILD_ADD:
      return {
        ...state,
        conversations: [
          action.payload,
          ...state.conversations,
        ],
      };
    case CHAT_ON_FAIL:
      return {
        ...state,
        error: action.error,
      };
    default:
      return state;
  }
}
