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
export const NOTIFY_TYPES = [LIKES, COMMENTS, NEW_POST, ACCEPTED_FRIEND, FRIEND_REQUEST];

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

export const PUBLIC = 'PUBLIC';
export const FRIEND = 'FRIEND';
export const ONLY_ME = 'ONLY_ME';
export const POST_PRIVACY = [PUBLIC, FRIEND, ONLY_ME];

export const TYPE1 = 'TYPE1';
export const TYPE2 = 'TYPE2';
export const ANNOUNCEMENT_TYPE = [TYPE1, TYPE2];
