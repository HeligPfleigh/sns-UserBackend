import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import isUndefined from 'lodash/isUndefined';
import isObject from 'lodash/isObject';
import isString from 'lodash/isString';
import merge from 'lodash/merge';
import mongoose from 'mongoose';
import {
  // buildSchemaFromTypeDefinitions,
  makeExecutableSchema,
} from 'graphql-tools';
import {
  PostsModel,
  FriendsRelationModel as FriendsModel,
  CommentsModel,
  NotificationsModel,
  BuildingMembersModel,
  UsersModel,
  BuildingsModel,
  ApartmentsModel,
} from './models';
import Service from './mongo/service';
import AddressServices from './apis/AddressServices';
import BuildingServices from './apis/BuildingServices';
import NotificationsService from './apis/NotificationsService';
import UsersService from './apis/UsersService';
import PostsService from './apis/PostsService';
import CommentService from './apis/CommentService';
import EventService from './apis/EventServices';
import {
  saveFeeForApartments,
  getFeeTypes,
} from './apis/FeeServices';
import {
  sendDeletedEventNotification,
  acceptedUserBelongsToBuildingNotification,
  rejectedUserBelongsToBuildingNotification,
  sendSharingPostNotification,
} from '../utils/notifications';
import { schema as schemaType, resolvers as resolversType } from './types';
import { ADMIN, PENDING, REJECTED, ACCEPTED, PUBLIC, FRIEND, ONLY_ME, EVENT } from '../constants';
import toObjectId from '../utils/toObjectId';

const { Types: { ObjectId } } = mongoose;
// import {
//   everyone,
//   authenticated,
//   isRole,
//   relation,
//   can,
//   onlyMe,
// } from '../utils/authorization';

const rootSchema = [`

type Test {
  hello: String
}

enum ResponseType {
  RESOURCE_UPDATED_SUCCESSFULLY
  RESOURCE_UPDATED_FAILURE
}

type Query {
  test: Test
  feeds(limit: Int, cursor: String): Feeds
  listEvent(limit: Int, cursor: String): Events
  post(_id: String!): Post
  user(_id: String): Friend
  me: Me
  getFeeTypes: [FeeType]
  apartment(_id: String): Apartment
  building(_id: String): Building
  buildings(query: String, limit: Int): [Building]
  notification(_id: String): Notification
  comment(_id: String): Comment
  notifications(limit: Int, cursor: String): NotificationsResult
  search(keyword: String!, numberOfFriends: Int): [Friend]
  event(_id: String!): Event
  resident(_id: String): User
  requestsToJoinBuilding(_id: String): RequestsToJoinBuilding
  checkExistUser(query: String): Boolean
}

input ProfileInput {
  picture: String
  firstName: String
  lastName: String
  gender: String
  dob: Date
  address: String
}

input UpdateUserProfileInput {
  userId: String!
  profile: ProfileInput
}

input EmailsInput {
  address: String!
  verified: Boolean
}

input PhoneInput {
  number: String!
  verified: Boolean
}

input CreateUserInput {
  apartments: [String!]
  building: String!
  emails: EmailsInput!
  password: String!
  phone: PhoneInput!
  username: String!
  profile: ProfileInput!
  services: String
}

type UpdateUserProfilePayload {
  user: User
}

type responsePayload {
  response: ResponseType
}

input AnnouncementInput {
  _id: ID
  type: BuildingAnnouncementType
  date: Date
  message: String
}

input CreateEventInput {
  privacy: PrivacyType
  building: String
  photos: [String]!
  name: String
  location: String!
  start: Date!
  end: Date!
  message: String!
  invites: [String]
}

input EditEventInput {
  _id: String!
  privacy: PrivacyType
  building: String
  photos: [String]!
  name: String
  location: String!
  start: Date!
  end: Date!
  message: String!
  invites: [String]
}

input CreateNewBuildingAnnouncementInput {
  buildingId: String!
  announcementInput: AnnouncementInput
}

type CreateNewBuildingAnnouncementPayload {
  announcement: BuildingAnnouncement
}

input UpdateBuildingAnnouncementInput {
  buildingId: String!
  announcementId: String!
  announcementInput: AnnouncementInput
}

type UpdateBuildingAnnouncementPayload {
  announcement: BuildingAnnouncement
}

input DeleteBuildingAnnouncementInput {
  buildingId: String!
  announcementId: String!
}

type DeleteBuildingAnnouncementPayload {
  announcement: BuildingAnnouncement
}

input ApprovingUserToBuildingInput {
  requestsToJoinBuildingId: String!
}

type ApprovingUserToBuildingPayload {
  request: RequestsToJoinBuilding
}

input RejectingUserToBuildingInput {
  requestsToJoinBuildingId: String!
}

type RejectingUserToBuildingPayload {
  request: RequestsToJoinBuilding
}

input Upload {
  name: String!
  type: String!
  size: Int!
  url: String!
}

type UploadFileResponse {
  name: String!
  type: String!
  size: Int!
  url: String!
}

type UploadSingleFileResponse {
  file: UploadFileResponse!
}

type UploadMultiFileResponse {
  files: [UploadFileResponse]!
}

type Mutation {
  uploadSingleFile(
    file: Upload!
  ): UploadSingleFileResponse!
  uploadMultiFile(
    files: [Upload!]!
  ): UploadMultiFileResponse!
  acceptFriend (
    _id: String!
  ): Friend
  rejectFriend (
    _id: String!
  ): Friend
  sendFriendRequest(
    _id: String!
  ): Friend
  likePost(
    _id: String!
  ): Post
  unlikePost(
    _id: String!
  ): Post
  createNewComment(
    _id:String!
    message: String!
    commentId: String
  ): Comment
  createNewPost (
    message: String!
    userId: String
    privacy: PrivacyType
    photos: [String]
  ): Post
  editPost (
    _id: String!
    message: String!
    photos: [String]
    privacy: String
    isDelPostSharing: Boolean
  ): Post
  deletePost (
    _id:String!
  ): Post
  deletePostOnBuilding (
    postId: String!
    buildingId: String!
  ): Post
  createUser(
    user: CreateUserInput!
  ): Author
  updateProfile(
    profile: ProfileInput!
  ): Author
  updateSeen: responsePayload
  updateRead(
    _id: String!
  ): Notification
  createNewPostOnBuilding (
    message: String!
    buildingId: String!
    photos: [String]
    privacy: PrivacyType
  ): Post
  acceptRequestForJoiningBuilding(
    buildingId: String!
    userId: String!
  ): Friend
  rejectRequestForJoiningBuilding(
    buildingId: String!
    userId: String!
  ): Friend
  sharingPost(
    _id: String!,
    message: String!
    privacy: String!
    userId: String
  ): Post
  createNewEvent(
    input: CreateEventInput!
  ): Event
  createNewEventOnBuilding(
    input: CreateEventInput!
  ): Event
  editEvent(
    input: EditEventInput!
  ): Event
  inviteResidentsJoinEvent(
    eventId: String!
    residentsId: [String]!
  ): Event
  interestEvent(
    eventId: String!
  ): Event
  joinEvent(
    eventId: String!
  ): Event
  canJoinEvent(
    eventId: String!
  ): Event
  cantJoinEvent(
    eventId: String!
  ): Event
  deleteEvent(
    eventId: String!
  ): Event
  updateUserProfile(
    input: UpdateUserProfileInput!
  ): UpdateUserProfilePayload
  createNewBuildingAnnouncement(
    input: CreateNewBuildingAnnouncementInput!
  ): CreateNewBuildingAnnouncementPayload
  updateBuildingAnnouncement(
    input: UpdateBuildingAnnouncementInput!
  ): UpdateBuildingAnnouncementPayload
  deleteBuildingAnnouncement(
    input: DeleteBuildingAnnouncementInput!
  ): DeleteBuildingAnnouncementPayload

  approvingUserToBuilding(
    input: ApprovingUserToBuildingInput!
  ): ApprovingUserToBuildingPayload
  rejectingUserToBuilding(
    input: RejectingUserToBuildingInput!
  ): RejectingUserToBuildingPayload
}

schema {
  query: Query
  mutation: Mutation
}
`];

const FeedsService = Service({
  Model: PostsModel,
  paginate: {
    default: 5,
    max: 10,
  },
  cursor: true,
});

const EventsListService = Service({
  Model: PostsModel,
  paginate: {
    default: 5,
    max: 10,
  },
  cursor: true,
});

const NotificationsPagingService = Service({
  Model: NotificationsModel,
  paginate: {
    default: 5,
    max: 10,
  },
  cursor: true,
});

const rootResolvers = {
  Query: {
    test() {
      return {
        hello: 'Hello world...',
      };
    },
    async feeds({ request }, { cursor = null, limit = 5 }) {
      const userId = request.user.id;
      const me = await UsersModel.findOne({ _id: userId });
      let friendListByIds = await FriendsModel.find({
        user: userId,
        isSubscribe: true,
      }).select('friend _id');
      friendListByIds = friendListByIds.map(v => v.friend);
      friendListByIds.push(userId);
      friendListByIds = friendListByIds.map(toObjectId);
      const r = await FeedsService.find({
        $cursor: cursor,
        $field: 'author',
        query: {
          $or: [
            { author: userId }, // post from me
            {
              user: { $in: friendListByIds },
              privacy: { $in: [PUBLIC, FRIEND] },
            },
            {
              building: me.building,
              privacy: { $in: [PUBLIC] },
            },
          ],
          isDeleted: { $exists: false },
          $sort: {
            createdAt: -1,
          },
          $limit: limit,
        },
      });
      return {
        pageInfo: r.paging,
        edges: r.data.map((res) => {
          res.likes.indexOf(userId) !== -1 ? res.isLiked = true : res.isLiked = false;
          return res;
        }),
      };
    },
    async post({ request }, { _id }) {
      const userId = request.user.id;
      const res = await PostsService.getPost(_id);
      if (res && res.likes) {
        res.likes.indexOf(userId) !== -1 ? res.isLiked = true : res.isLiked = false;
      }
      return res;
    },
    apartment(root, { _id }) {
      return AddressServices.getApartment(_id);
    },
    building(root, { _id }) {
      return AddressServices.getBuilding(_id);
    },
    async buildings(root, { query, limit }) {
      const results = await BuildingServices.searchBuildings(query, limit);
      return results;
    },
    user(root, { _id }) {
      return UsersService.getUser(_id);
    },
    notification(root, { _id }) {
      return NotificationsService.getNotification(_id);
    },
    comment(root, { _id }) {
      return CommentsModel.findOne({ _id });
    },
    me({ request }) {
      return UsersService.getUser(request.user.id);
    },
    async notifications({ request }, { cursor = null, limit = 20 }) {
      const userId = request.user.id;
      const r = await NotificationsPagingService.find({
        $cursor: cursor,
        query: {
          $sort: {
            createdAt: -1,
          },
          user: userId,
          $limit: limit,
        },
      });
      return {
        pageInfo: r.paging,
        edges: r.data,
      };
    },
    async search({ request }, { keyword, numberOfFriends = 1000 }) {
      // no select password
      const userId = request.user.id;
      const u = await UsersModel.findOne({
        _id: userId,
      });
      const r = await UsersModel.find({
        _id: { $nin: [u._id] },
        building: u.building,
        $text: {
          $search: keyword,
          $caseSensitive: false,
        },
      }, {
        score: { $meta: 'textScore' },
      })
        .sort({ score: { $meta: 'textScore' } })
        .limit(numberOfFriends);
      return r;
    },
    async listEvent({ request }, variables) {
      const { cursor, limit } = variables;
      const userId = request.user.id;
      const me = await UsersModel.findOne({ _id: userId });
      let friendListByIds = await FriendsModel.find({
        user: userId,
        isSubscribe: true,
      }).select('friend _id');
      friendListByIds = friendListByIds.map(v => v.friend);
      friendListByIds.push(userId);
      friendListByIds = friendListByIds.map(toObjectId);
      const r = await EventsListService.find({
        $cursor: cursor,
        $field: 'author',
        query: {
          type: EVENT,
          $or: [
            {
              privacy: PUBLIC,
            }, // post from me
            {
              user: { $in: friendListByIds },
              privacy: { $in: [PUBLIC, FRIEND] },
            },
            {
              building: me.building,
              privacy: { $in: [PUBLIC] },
            },
            {
              author: userId,
            },
          ],
          isDeleted: { $exists: false },
          $sort: {
            createdAt: -1,
          },
          $limit: limit,
        },
      });
      return {
        pageInfo: r.paging,
        edges: r.data,
      };
    },
    async event({ request }, { _id }) {
      // TODO
      const userId = request.user.id;
      const res = await EventService.getEvent(_id, userId);
      res.isAuthor = res.author === userId;
      return res;
    },
    resident(root, { _id }) {
      return UsersService.getUser(_id);
    },
    requestsToJoinBuilding(root, { _id }) {
      return BuildingMembersModel.findOne({ _id });
    },
    checkExistUser(root, { query }) {
      if (isEmpty(query)) {
        return false;
      }
      return UsersService.checkExistUser(query);
    },
    // Feetype
    /**
     * Get fee types
     * @author: HungTran
     */
    getFeeTypes() {
      return getFeeTypes();
    },
  },
  Mutation: {
    acceptFriend({ request }, { _id }) {
      return UsersService.acceptFriend(request.user.id, _id);
    },
    rejectFriend({ request }, { _id }) {
      return UsersService.rejectFriend(request.user.id, _id);
    },
    sendFriendRequest({ request }, { _id }) {
      return UsersService.sendFriendRequest(request.user.id, _id);
    },
    async editEvent({ request }, { input: { _id, ...data } }) {
      const p = await PostsModel.findOne({ _id });
      if (!p) {
        throw new Error('Post not found');
      }

      if (isUndefined(p.author)) {
        throw new Error('Access denied');
      }

      if (!await UsersModel.findOne({ _id: p.author })) {
        throw new Error('Author does not exist');
      }

      const r = await EventService.editEvent(_id, {
        ...data,
      });
      return r;
    },
    createNewEvent({ request }, { input }) {
      const { privacy, photos, name, location, start, end, message, invites } = input;
      return EventService.createEvent(privacy, request.user.id, photos, name, location, start, end, message, invites);
    },
    async interestEvent({ request }, { eventId }) {
      return EventService.interestEvent(request.user.id, eventId);
    },

    createNewEventOnBuilding({ request }, { input }) {
      const { privacy, photos, name, building, location, start, end, message, invites } = input;
      return EventService.createEventOnBuilding(privacy, request.user.id, photos, building, name, location, start, end, message, invites);
    },
    async inviteResidentsJoinEvent({ request }, { eventId, residentsId }) {
      const event = await PostsModel.findOne({
        _id: eventId,
        author: request.user.id,
      });
      if (!event) {
        throw new Error('not found the event');
      }
      return EventService.invitesResidentJoinEvent(eventId, residentsId);
    },
    async joinEvent({ request }, { eventId }) {
      const event = await PostsModel.findOne({
        _id: eventId,
      });
      if (!event) {
        throw new Error('not found the event');
      }
      return EventService.joinEvent(request.user.id, eventId);
    },
    async canJoinEvent({ request }, { eventId }) {
      const event = await PostsModel.findOne({
        _id: eventId,
      });
      if (!event) {
        throw new Error('not found the event');
      }
      return EventService.canJoinEvent(request.user.id, eventId);
    },
    async cantJoinEvent({ request }, { eventId }) {
      const event = await PostsModel.findOne({
        _id: eventId,
      });
      if (!event) {
        throw new Error('not found the event');
      }
      return EventService.cantJoinEvent(request.user.id, eventId);
    },
    async deleteEvent({ request }, { eventId }) {
      const p = await PostsModel.findOne({
        _id: eventId,
        author: request.user.id,
        start: {
          $gt: new Date(),
        },
      });
      if (!p) {
        throw new Error('not found the post');
      }
      await PostsModel.update({
        _id: eventId,
        author: request.user.id,
      }, {
        $set: {
          isDeleted: true,
        },
      });
      sendDeletedEventNotification(p.joins, p._id, request.user.id);
      return p;
    },
    likePost({ request }, { _id }) {
      return PostsService.likePost(request.user.id, _id);
    },
    unlikePost({ request }, { _id }) {
      return PostsService.unlikePost(request.user.id, _id);
    },
    createNewComment({ request }, { _id, message, commentId }) {
      return CommentService.createNewComment(request.user.id, _id, message, commentId);
    },
    createNewPost({ request }, { message, userId, privacy = PUBLIC, photos }) {
      // NOTE:
      // userId: post on friend wall
      if (!message.trim()) {
        throw new Error('you can not create a new post with empty message');
      }
      return PostsService.createNewPost(request.user.id, message, userId, privacy, photos);
    },
    async deletePost({ request }, { _id }) {
      const p = await PostsModel.findOne({
        _id,
        author: request.user.id,
      });
      if (!p) {
        throw new Error('not found the post');
      }
      await PostsModel.update({
        _id,
        author: request.user.id,
      }, {
        $set: {
          isDeleted: true,
        },
      });
      return p;
    },
    async deletePostOnBuilding({ request }, { postId, buildingId }) {
      const p = await PostsModel.findOne({
        _id: postId,
        author: request.user.id,
        building: buildingId,
      });
      if (!p) {
        throw new Error('not found the post');
      }
      await PostsModel.update({
        _id: postId,
        author: request.user.id,
        building: buildingId,
      }, {
        $set: {
          isDeleted: true,
        },
      });
      return p;
    },
    async createUser(root, { user }) {
      const r = await UsersService.createUser(user);
      return r;
    },
    updateProfile({ request }, { profile }) {
      return UsersService.updateProfile(request.user.id, profile);
    },
    updateSeen({ request }) {
      return NotificationsService.updateSeen(request.user.id);
    },
    updateRead({ request }, { _id }) {
      return NotificationsService.updateRead(request.user.id, _id);
    },
    createNewPostOnBuilding({ request }, { message, photos, buildingId, privacy = PUBLIC }) {
      // NOTE:
      // buildingId: post on building
      if (!message.trim()) {
        throw new Error('you can not create a new post with empty message');
      }
      return PostsService.createNewPostOnBuilding(request.user.id, message, photos, buildingId, privacy);
    },
    async acceptRequestForJoiningBuilding({ request }, { buildingId, userId }) {
      // Determine whether building already exists yet.
      const buildingDocument = await BuildingsModel.findOne({ _id: buildingId });
      if (!buildingDocument) {
        throw new Error('Building not found.');
      }

      // Determine whether user already exists yet.
      const userDocument = await UsersModel.findOne({ _id: userId });
      if (!userDocument) {
        throw new Error('User not found.');
      }

      // Merge building info into user
      userDocument.building = buildingDocument;

      const isAdmin = await BuildingMembersModel.findOne({
        building: buildingId,
        user: request.user.id,
        type: ADMIN,
      });
      if (!isAdmin) {
        throw new Error('you don\'t have permission to reject request');
      }

      const record = await BuildingMembersModel.findOne({
        building: buildingId,
        user: userId,
        status: PENDING,
      });
      if (!record) {
        throw new Error('not found the request');
      }

      // update users joined apartments
      const { requestInformation: { apartments } } = record;
      if (isEmpty(apartments)) {
        throw new Error('User don\'t provided apartment info. Request rejected');
      }

      await (apartments || []).map(async (apartmentId) => {
        await ApartmentsModel.findByIdAndUpdate(apartmentId, {
          $addToSet: { users: record.user },
        });
      });

      // NOTE: what happens if we lost connection to db
      await BuildingMembersModel.update({
        building: buildingId,
        user: userId,
      }, {
        $set: {
          status: ACCEPTED,
        },
      });

      // Get all BOMs
      const BOMs = await BuildingMembersModel.distinct('user', {
        building: buildingId,
        type: ADMIN,
        status: ACCEPTED,
        user: {
          $nin: [request.user.id],
        },
      });

      // Notify to BOMs
      if (BOMs) {
        BOMs.push(userId);
        await acceptedUserBelongsToBuildingNotification(userDocument._id, BOMs);
      }

      // Sending email
      if (isObject(userDocument.emails) && isString(userDocument.emails.address)) {
        await BuildingServices.notifywhenAcceptedForUserBelongsToBuilding(userDocument.emails.address, userDocument);
      }
      const buildingMember = await BuildingMembersModel.findOne({
        building: buildingId,
        user: userId,
      });
      return userDocument;
    },
    async rejectRequestForJoiningBuilding({ request }, { buildingId, userId }) {
      // Determine whether building already exists yet.
      const buildingDocument = await BuildingsModel.findOne({ _id: buildingId });
      if (!buildingDocument) {
        throw new Error('Building not found.');
      }

      // Determine whether user already exists yet.
      const userDocument = await UsersModel.findOne({ _id: userId });
      if (!userDocument) {
        throw new Error('User not found.');
      }

      // Merge building info into user
      userDocument.building = buildingDocument;

      const isAdmin = await BuildingMembersModel.findOne({
        building: buildingId,
        user: request.user.id,
        type: ADMIN,
      });
      if (!isAdmin) {
        throw new Error('you don\'t have permission to reject request');
      }
      const record = await BuildingMembersModel.findOne({
        building: buildingId,
        user: userId,
        status: PENDING,
      });
      if (!record) {
        throw new Error('not found the request');
      }

      // NOTE: what happens if we lost connection to db
      await BuildingMembersModel.update({
        building: buildingId,
        user: userId,
      }, {
        $set: {
          status: REJECTED,
        },
      });

      // Get all BOMs
      const BOMs = await BuildingMembersModel.distinct('user', {
        building: buildingId,
        type: ADMIN,
        status: ACCEPTED,
        user: {
          $nin: [request.user.id],
        },
      });

      // Notify to BOMs
      if (BOMs) {
        BOMs.push(userId);
        await rejectedUserBelongsToBuildingNotification(userDocument._id, BOMs);
      }
      // Sending email
      if (isObject(userDocument.emails) && isString(userDocument.emails.address)) {
        await BuildingServices.notifywhenRejectedForUserBelongsToBuilding(userDocument.emails.address, userDocument);
      }

      return userDocument;
    },
    async editPost(root, { _id, message, photos, privacy = PUBLIC, isDelPostSharing = true }) {
      const p = await PostsModel.findOne({ _id });
      if (!p) {
        throw new Error('not found the post');
      }
      await PostsModel.update({
        _id,
      }, {
        $set: {
          message,
          photos,
          privacy,
          sharing: isDelPostSharing ? p.sharing : null,
        },
      });
      return PostsModel.findOne({
        _id,
      });
    },
    async sharingPost({ request }, { _id, privacy = PUBLIC, message, userId }) {
      const author = request.user.id;

      if (isUndefined(author)) {
        throw new Error('author is undefined');
      }

      if (!await UsersModel.findOne({ _id: author })) {
        throw new Error('author does not exist');
      }

      if (userId && !await FriendsModel.findOne({
        friend: author,
        user: userId,
        status: ACCEPTED,
      })) {
        throw new Error('You are not user friend');
      }

      const p = await PostsModel.findOne({ _id });
      if (!p) {
        throw new Error('Not found the post');
      }
      const sharingId = p.sharing;
      let r = null;
      if (!sharingId) {
        r = await PostsModel.create({
          author,
          privacy,
          message,
          sharing: _id,
          user: userId || author,
        });
      } else {
        r = await PostsModel.create({
          author,
          privacy,
          message,
          sharing: sharingId,
          user: userId || author,
        });
      }
      if (userId && !isEqual(userId, author)) {
        sendSharingPostNotification(author, p.author, r._id);
      }
      r.isLiked = false;
      return r;
    },
    async updateUserProfile({ request }, { input }) {
      const {
        userId,
        profile,
      } = input;
      if (request.user.id !== userId) {
        throw new Error('not author');
      }
      const update = {
        $set: {},
      };
      if (profile.firstName) {
        update.$set['profile.firstName'] = profile.firstName;
      }
      if (profile.gender) {
        update.$set['profile.gender'] = profile.gender;
      }
      if (profile.lastName) {
        update.$set['profile.lastName'] = profile.lastName;
      }
      await UsersModel.update({
        _id: userId,
      }, update);
      return {
        user: await UsersModel.findOne({
          _id: userId,
        }),
      };
    },
    async createNewBuildingAnnouncement({ request }, { input }) {
      const userId = request.user.id;
      const {
        buildingId,
        announcementInput: {
          type,
          message,
        },
      } = input;
      const role = await BuildingMembersModel.findOne({
        building: buildingId,
        user: userId,
        type: ADMIN,
        status: ACCEPTED,
      });
      if (!role) {
        throw new Error('you dont have permission to create new announcement');
      }
      const announcement = {
        _id: new ObjectId(),
        type,
        message,
        date: new Date(),
      };
      await BuildingsModel.update(
        { _id: buildingId },
        { $push: { announcements: announcement } },
      );
      return {
        announcement,
      };
    },
    async updateBuildingAnnouncement({ request }, { input }) {
      const userId = request.user.id;
      const {
        buildingId,
        announcementId,
        announcementInput: {
          type,
          message,
        },
      } = input;
      const role = await BuildingMembersModel.findOne({
        building: buildingId,
        user: userId,
        type: ADMIN,
        status: ACCEPTED,
      });
      if (!role) {
        throw new Error('you dont have permission to create new announcement');
      }
      // check if announcement and building exist
      const a = await BuildingsModel.findOne(
        {
          _id: buildingId,
          'announcements._id': toObjectId(announcementId),
        },
      );
      if (!a) {
        throw Error('not found building or announcement');
      }
      const update = {
        $set: {},
      };
      if (message) {
        update.$set['announcements.$.message'] = message;
      }
      if (type) {
        update.$set['announcements.$.type'] = type;
      }
      await BuildingsModel.update(
        {
          _id: buildingId,
          'announcements._id': announcementId,
        },
        update,
      );
      // ??? performance
      let announcement = a.announcements.filter(t => t._id.toString() === announcementId);
      announcement = announcement[0];
      if (message) {
        announcement.message = message;
      }
      if (type) {
        announcement.type = type;
      }
      return {
        announcement,
      };
    },
    async deleteBuildingAnnouncement({ request }, { input }) {
      const userId = request.user.id;
      const {
        buildingId,
        announcementId,
      } = input;
      const role = await BuildingMembersModel.findOne({
        building: buildingId,
        user: userId,
        type: ADMIN,
        status: ACCEPTED,
      });
      if (!role) {
        throw new Error('you dont have permission to create new announcement');
      }
      const a = await BuildingsModel.findOne(
        {
          _id: buildingId,
          'announcements._id': announcementId,
        },
      );
      if (!a) {
        throw Error('not found building or announcement');
      }
      const update = {
        $pull: {
          announcements: {
            _id: announcementId,
          },
        },
      };
      await BuildingsModel.update(
        {
          _id: buildingId,
          'announcements._id': announcementId,
        },
        update,
      );
      // ??? performance
      let announcement = a.announcements.filter(t => t._id.toString() === announcementId);
      announcement = announcement[0];
      return {
        announcement,
      };
    },
    async approvingUserToBuilding({ request }, { input }) {
      const { requestsToJoinBuildingId } = input;

      const record = await BuildingMembersModel.findOne({ _id: requestsToJoinBuildingId });
      if (!record) {
        throw new Error('not found the request');
      }

      const isAdmin = await BuildingMembersModel.findOne({
        building: record.building,
        user: request.user.id,
        type: ADMIN,
      });

      if (!isAdmin) {
        throw new Error('you don\'t have permission to approve request');
      }

      if (record.status !== PENDING) {
        return {
          request: record,
        };
      }

      // NOTE: what happens if we lost connection to db
      await BuildingMembersModel.update({
        _id: requestsToJoinBuildingId,
      }, {
        $set: {
          status: ACCEPTED,
        },
      });

      // update users joined apartments
      const { requestInformation: { apartments } } = record;
      if (isEmpty(apartments)) {
        throw new Error('User don\'t provided apartment info. Request rejected');
      }

      await (apartments || []).map(async (apartmentId) => {
        await ApartmentsModel.findByIdAndUpdate(apartmentId, {
          $addToSet: { users: record.user },
        });
      });

      // set user active
      await UsersModel.findByIdAndUpdate(record.user, { isActive: 1 });

      // Send email and notification to user status ACCEPTED

      return {
        request: BuildingMembersModel.findOne({ _id: requestsToJoinBuildingId }),
      };
    },
    async rejectingUserToBuilding({ request }, { input }) {
      const { requestsToJoinBuildingId } = input;

      const record = await BuildingMembersModel.findOne({ _id: requestsToJoinBuildingId });
      if (!record) {
        throw new Error('not found the request');
      }

      const isAdmin = await BuildingMembersModel.findOne({
        building: record.building,
        user: request.user.id,
        type: ADMIN,
      });

      if (!isAdmin) {
        throw new Error('you don\'t have permission to reject request');
      }

      if (record.status === REJECTED) {
        return {
          request: record,
        };
      }

      if (record.status === ACCEPTED) {
        // update users joined apartments
        const { requestInformation: { apartments } } = record;
        if (!isEmpty(apartments)) {
          await (apartments || []).map(async (apartmentId) => {
            await ApartmentsModel.findByIdAndUpdate(apartmentId, {
              $pull: { users: record.user },
            });
          });

          // set user active
          // await UsersModel.findByIdAndUpdate(record.user, { isActive: 1 });
        }
      }

      // NOTE: what happens if we lost connection to db
      await BuildingMembersModel.update({
        _id: requestsToJoinBuildingId,
      }, {
        $set: {
          status: REJECTED,
        },
      });

      // Send email and notification to user status ACCEPTED

      return {
        request: BuildingMembersModel.findOne({ _id: requestsToJoinBuildingId }),
      };
    },
    uploadSingleFile(root, { file }) {
      return {
        file,
      };
    },
    uploadMultiFile(root, { files }) {
      return {
        files,
      };
    },
  },
};

const schema = [...rootSchema, ...schemaType];
const resolvers = merge(rootResolvers, resolversType);

const executableSchema = makeExecutableSchema({
  typeDefs: schema,
  resolvers,
});

export default executableSchema;
