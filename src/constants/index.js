/* eslint-disable import/prefer-default-export */

export const SET_RUNTIME_VARIABLE = 'SET_RUNTIME_VARIABLE';

export const MALE = 'MALE';
export const FEMALE = 'FEMALE';
export const GENDER = [MALE, FEMALE];

export const STATUS = 'STATUS';
export const EVENT = 'EVENT';
export const POST_TYPES = [STATUS, EVENT];

export const PENDING = 'PENDING';
export const ACCEPTED = 'ACCEPTED';
export const REJECTED = 'REJECTED';
export const BLOCKED = 'BLOCKED';
export const NONE = 'NONE';

export const ADMIN = 'ADMIN';
export const MEMBER = 'MEMBER';
export const BUILDING_MEMBER_TYPE = [ADMIN, MEMBER];
export const BUILDING_MEMBER_STATUS = [PENDING, ACCEPTED, REJECTED];

export const LIKES = 'LIKES';
export const COMMENTS = 'COMMENTS';
export const NEW_POST = 'NEW_POST';
export const ACCEPTED_FRIEND = 'ACCEPTED_FRIEND';
export const FRIEND_REQUEST = 'FRIEND_REQUEST';
export const EVENT_INVITE = 'EVENT_INVITE';
export const JOIN_EVENT = 'JOIN_EVENT';
export const CAN_JOIN_EVENT = 'CAN_JOIN_EVENT';
export const CANT_JOIN_EVENT = 'CANT_JOIN_EVENT';
export const EVENT_DELETED = 'EVENT_DELETED';
export const EVENT_CANCELLED = 'EVENT_CANCELLED';
export const ACCEPTED_JOIN_BUILDING = 'ACCEPTED_JOIN_BUILDING';
export const REJECTED_JOIN_BUILDING = 'REJECTED_JOIN_BUILDING';
export const SHARING_POST = 'SHARING_POST';
export const INTEREST_EVENT = 'INTEREST_EVENT';
export const DISINTEREST_EVENT = 'DISINTEREST_EVENT';
export const NEW_FEE_APARTMENT = 'NEW_FEE_APARTMENT';
export const NEW_ANNOUNCEMENT = 'NEW_ANNOUNCEMENT';
export const REMIND_FEE = 'REMIND_FEE';
export const NOTIFY_TYPES = [
  LIKES,
  COMMENTS,
  NEW_POST,
  ACCEPTED_FRIEND,
  FRIEND_REQUEST,
  EVENT_INVITE,
  JOIN_EVENT,
  CAN_JOIN_EVENT,
  CANT_JOIN_EVENT,
  EVENT_DELETED,
  EVENT_CANCELLED,
  ACCEPTED_JOIN_BUILDING,
  REJECTED_JOIN_BUILDING,
  SHARING_POST,
  INTEREST_EVENT,
  DISINTEREST_EVENT,
  NEW_FEE_APARTMENT,
  NEW_ANNOUNCEMENT,
  REMIND_FEE,
];

export const PAID = 'PAID';
export const UNPAID = 'UNPAID';
export const PARTIALLY_PAID = 'PARTIALLY_PAID';
export const FEE_STATUS = [PAID, UNPAID];

export const CONTROL_NEW_CONVERSATION = 'CONTROL_NEW_CONVERSATION';
export const ADD_USER_NEW_CONVERSATION = 'ADD_USER_NEW_CONVERSATION';
export const CHAT_SET_USER = 'CHAT_SET_USER';
export const CHAT_SEND_MESSAGE = 'CHAT_SEND_MESSAGE';
export const CHAT_ON_MESSAGE_CHILD_ADD = 'CHAT_ON_MESSAGE_CHILD_ADD';
export const CHAT_LOAD_MESSAGE_HISTORY_SUCCESS = 'CHAT_LOAD_MESSAGE_HISTORY_SUCCESS';
export const CHAT_ON_CONVERSATION_CHILD_ADD = 'CHAT_ON_CONVERSATION_CHILD_ADD';
export const CHAT_LOAD_CONVERSATION_HISTORY_SUCCESS = 'CHAT_LOAD_CONVERSATION_HISTORY_SUCCESS';
export const CHAT_ACTIVE_CONVERSATION = 'CHAT_ACTIVE_CONVERSATION';
export const CHAT_ON_CHANGE_ONLINE_STATE = 'CHAT_ON_CHANGE_ONLINE_STATE';
export const CHAT_ON_FAIL = 'CHAT_ON_FAIL';

export const PRIVATE = 'PRIVATE';
export const PUBLIC = 'PUBLIC';
export const FRIEND = 'FRIEND';
export const ONLY_ME = 'ONLY_ME';
export const ONLY_ADMIN_BUILDING = 'ONLY_ADMIN_BUILDING';
export const POST_PRIVACY = [PUBLIC, FRIEND, ONLY_ME, ONLY_ADMIN_BUILDING];

export const RESOURCE_UPDATED_SUCCESSFULLY = 'RESOURCE_UPDATED_SUCCESSFULLY';
export const RESOURCE_UPDATED_FAILURE = 'RESOURCE_UPDATED_FAILURE';
