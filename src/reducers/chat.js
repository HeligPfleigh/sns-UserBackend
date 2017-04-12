import { CONTROL_NEW_CONVERSATION, ADD_USER_NEW_CONVERSATION } from '../constants';

const initialState = {
  new: {
    active: false,
  },
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
            user: action.payload,
          },
        };
      }
      return state;
    default:
      return state;
  }
}
