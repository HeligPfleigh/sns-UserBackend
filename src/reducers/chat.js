import { CONTROL_NEW_CONVERSATION } from '../constants';

const initialState = {
  new: {
    active: false,
  },
};
export default function chat(state = initialState, action) {
  switch (action.type) {
    case CONTROL_NEW_CONVERSATION:
      return {
        ...state,
        new: {
          active: action.payload.active,
        },
      };
    default:
      return state;
  }
}
