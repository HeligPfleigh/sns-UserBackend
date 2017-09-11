import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import isUndefined from 'lodash/isUndefined';
import isObject from 'lodash/isObject';
import isString from 'lodash/isString';
import merge from 'lodash/merge';
import map from 'lodash/map';
import includes from 'lodash/includes';
import without from 'lodash/without';
import mongoose from 'mongoose';
import { generate as keyRandom } from 'shortid';
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
  FeeModel,
  AnnouncementsModel,
} from './models';
import Service from './mongo/service';
import AddressServices from './apis/AddressServices';
import BuildingServices from './apis/BuildingServices';
import NotificationsService from './apis/NotificationsService';
import UsersService from './apis/UsersService';
import PostsService from './apis/PostsService';
import * as DocumentsService from './apis/DocumentsService';
import * as FAQsService from './apis/FAQsService';
import CommentService from './apis/CommentService';
import EventService from './apis/EventServices';
import {
  // saveFeeForApartments,
  getFeeTypes,
} from './apis/FeeServices';
import {
  sendDeletedEventNotification,
  acceptedUserBelongsToBuildingNotification,
  rejectedUserBelongsToBuildingNotification,
  sendSharingPostNotification,
  sendNewFeeForApartmentNotification,
  sendNewAnnouncementNotification,
} from '../utils/notifications';
import { schema as schemaType, resolvers as resolversType } from './types';
import { ADMIN, PENDING, REJECTED, ACCEPTED, PUBLIC, PRIVATE, FRIEND, EVENT, PAID, UNPAID, PARTIALLY_PAID } from '../constants';
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
  fees(buildingId: String!, limit: Int, cursor: String): FeesResult
  feesReport(buildingId: String!, page: Int, limit: Int, feeDate: String, feeType: Int): FeesResult
  feesOfApartment(apartmentId: String!, feeDate: String, feeType: Int): [Fee]
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
  documents(building: String, limit: Int, page: Int, cursor: String): Documents
  FAQs(building: String, limit: Int, page: Int, cursor: String): FAQs
  fee(_id: String!): Fee
  announcement(_id: String!): Announcement,
  getBOMList(buildingId: String!): [User]
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

input UpdateFeeDetailInput {
  feeId: String!
  total: Int!
  status: String!
  buildingId: String!
}

input ReminderToPayFeeInput {
  _id: String!
  apartment: String!
  building: String!
}

input EditAnnouncementInput {
  _id: String!
  message: String!
  description: String
  privacy: AnnouncementType!
  apartments: [String!]
}

type UpdateFeeDetailPayload {
  fee: Fee
}

type UpdateUserProfilePayload {
  user: User
}

type responsePayload {
  response: ResponseType
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

input CreateNewAnnouncementInput {
  date: Date
  message: String
  description: String
  privacy: AnnouncementType!
  apartments: [String]
  buildingId: String!
}

input UpdateBuildingAnnouncementInput {
  buildingId: String!
  announcementId: String!
}

type UpdateBuildingAnnouncementPayload {
  announcement: Announcement
}

input DeleteBuildingAnnouncementInput {
  buildingId: String!
  announcementId: String!
}

type DeleteBuildingAnnouncementPayload {
  announcement: Announcement
}

input CreateDocumentInput {
  name: String!
  file: String!
  building: String!
}

input UpdateDocumentInput {
  _id: String!
  name: String!
  file: String!
  building: String!
}

input DeleteDocumentInput {
  _id: String!
  building: String!
}

input CreateFAQInput {
  name: String!
  message: String!
  building: String!
}

input UpdateFAQInput {
  _id: String!
  name: String!
  message: String!
  building: String!
}

input DeleteFAQInput {
  _id: String!
  building: String!
}

input ApprovingUserToBuildingInput {
  requestsToJoinBuildingId: String!
}

type ApprovingUserToBuildingPayload {
  request: RequestsToJoinBuilding
}

input RejectingUserToBuildingInput {
  requestsToJoinBuildingId: String!
  message: String!
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
  sharingPost(
    _id: String!,
    message: String!
    privacy: String!
    friendId: String
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
  createNewAnnouncement(
    input: CreateNewAnnouncementInput!
  ): Announcement
  updateBuildingAnnouncement(
    input: UpdateBuildingAnnouncementInput!
  ): UpdateBuildingAnnouncementPayload
  deleteBuildingAnnouncement(
    input: DeleteBuildingAnnouncementInput!
  ): DeleteBuildingAnnouncementPayload
  createDocument(
    input: CreateDocumentInput!
  ): Document
  updateDocument(
    input: UpdateDocumentInput!
  ): Document
  deleteDocument(
    input: DeleteDocumentInput!
  ): Document
  createFAQ(
    input: CreateFAQInput!
  ): FAQ
  updateFAQ(
    input: UpdateFAQInput!
  ): FAQ
  deleteFAQ(
    input: DeleteFAQInput!
  ): FAQ
  approvingUserToBuilding(
    input: ApprovingUserToBuildingInput!
  ): ApprovingUserToBuildingPayload
  rejectingUserToBuilding(
    input: RejectingUserToBuildingInput!
  ): RejectingUserToBuildingPayload

  updateFeeDetail(
    input: UpdateFeeDetailInput!
  ): UpdateFeeDetailPayload
  reminderToPayFee(
    input: ReminderToPayFeeInput!
  ): Fee

  deleteAnnouncement(
    _id: String!
    buildingId: String!
  ): Announcement

  editAnnouncement(
    input: EditAnnouncementInput!
  ): Announcement
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

const FeesService = Service({
  Model: FeeModel,
  paginate: {
    default: 5,
    max: 50,
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

    getBOMList(_, { buildingId }) {
      const rs = BuildingServices.getBOMOfBuilding(buildingId);
      return rs;
    },

    async documents(_, { building, limit = 20, page = 0 }) {
      const r = await DocumentsService.service({ limit }).findBySkip({
        query: {
          building,
          isDeleted: { $exists: false },
          $sort: {
            createdAt: -1,
          },
          $skip: page * limit,
          $limit: limit,
        },
      });
      return {
        pageInfo: {
          ...r.paging,
          page,
        },
        edges: r.data,
      };
    },
    async FAQs(_, { building, limit = 20, page = 1 }) {
      page = page === 0 ? 1 : page;

      const r = await FAQsService.service({ limit }).findBySkip({
        query: {
          building,
          isDeleted: { $exists: false },
          $sort: {
            createdAt: -1,
          },
          $skip: (page - 1) * limit,
          $limit: limit,
        },
      });

      return {
        pageInfo: {
          ...r.paging,
          page,
        },
        edges: r.data,
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
    async feesReport(context, { buildingId, page = 1, limit = 10, feeDate, feeType }) {
      let treeMode = true;
      // eslint-disable-next-line
      let filters = {
        building: toObjectId(buildingId),
      };

      // add filter data by fee date
      if (feeDate && feeDate !== '') {
        const [month, year] = feeDate.split('-');
        filters = {
          ...filters,
          month: Number(month),
          year: Number(year),
        };
      }

      if (isUndefined(filters.month)) {
        const { month, year } = await FeeModel.findOne({
        }).sort({
          month: -1,
          year: -1,
        }).select('month year');

        filters = {
          ...filters,
          month,
          year,
        };
      }

      // add filter data by fee type
      if (feeType && feeType !== 0) {
        treeMode = false;
        filters = {
          ...filters,
          'type.code': feeType,
        };
      }

      const options = [{ $match: filters }];

      if (treeMode) {
        options.push({
          $group: {
            _id: {
              month: '$month',
              year: '$year',
              apartment: '$apartment',
              building: '$building',
            },
            count: { $sum: 1 },
            totals: { $sum: '$total' },
          },
        });
      }

      const count = (await FeeModel.aggregate([...options])).length;

      const result = await FeeModel.aggregate([
        ...options,
        {
          $sort: {
            '_id.year': -1,
            '_id.month': -1,
          },
        },
        { $skip: (page - 1) * limit },
        { $limit: limit },
      ]);

      const data = await Promise.all((result || []).map(async (item) => {
        if (treeMode) {
          const detail = await FeeModel.find(item._id);

          const statusList = map(detail, 'status');
          let status = includes(statusList, PAID) ? PAID : UNPAID;
          if (status === PAID) {
            const paids = without(statusList, UNPAID);
            status = paids.length === statusList.length ? PAID : PARTIALLY_PAID;
          }

          return {
            _id: keyRandom(),
            ...item._id,
            type: {
              _id: keyRandom(),
              code: 0,
              name: 'Chọn chi phí',
            },
            totals: item.totals,
            detail,
            status,
          };
        }

        const {
          _id, month, year,
          building, apartment,
          type, total, status,
        } = item;

        return {
          _id,
          month,
          year,
          apartment,
          building,
          type,
          totals: total,
          detail: [],
          status,
        };
      }));

      return {
        pageInfo: {
          total: count,
          limit,
        },
        edges: data,
      };
    },
    async fees(context, { buildingId, cursor = null, limit = 25 }) {
      const r = await FeesService.find({
        $cursor: cursor,
        query: {
          building: buildingId,
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
    async feesOfApartment(context, { apartmentId, feeDate, feeType }) {
      // eslint-disable-next-line
      let filters = {
        apartment: toObjectId(apartmentId),
      };

      // add filter data by fee date
      if (feeDate && feeDate !== '') {
        const [month, year] = feeDate.split('-');
        filters = {
          ...filters,
          month: Number(month),
          year: Number(year),
        };
      }

      // add filter data by fee type
      if (feeType && feeType !== 0) {
        filters = {
          ...filters,
          'type.code': feeType,
        };
      }

      const options = [{
        $match: filters,
      }, {
        $group: {
          _id: {
            month: '$month',
            year: '$year',
            apartment: '$apartment',
            building: '$building',
          },
          count: { $sum: 1 },
          totals: { $sum: '$total' },
        },
      }];

      const result = await FeeModel.aggregate([
        ...options,
        {
          $sort: {
            '_id.year': -1,
            '_id.month': -1,
          },
        },
        { $limit: 3 },
      ]);

      const data = await Promise.all((result || []).map(async (item) => {
        const detail = await FeeModel.find({
          ...item._id,
          'type.code': (feeType && (feeType !== 0)) ? feeType : { $exists: true },
        });
        return { ...item._id, totals: item.totals, detail };
      }));

      return data;
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
    async fee(root, { _id }) {
      const f = await FeeModel.findOne({ _id });
      if (!f) {
        throw new Error('not found the fee');
      }
      return f;
    },
    // Feetype
    /**
     * Get fee types
     * @author: HungTran
     */
    getFeeTypes() {
      return getFeeTypes();
    },
    async announcement(root, { _id }) {
      const r = await AnnouncementsModel.findOne({ _id });
      if (!r) {
        throw new Error('not found the announcement');
      }
      return r;
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
    async editEvent(_, { input: { _id, ...data } }) {
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
    async sharingPost({ request }, { _id, privacy = PUBLIC, message, friendId, userId }) {
      const author = request.user.id;

      if (isUndefined(author)) {
        throw new Error('author is undefined');
      }

      if (!await UsersModel.findOne({ _id: author })) {
        throw new Error('author does not exist');
      }

      if (friendId && !await FriendsModel.findOne({
        friend: author,
        user: friendId,
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
          user: friendId || author,
        });
      } else {
        r = await PostsModel.create({
          author,
          privacy,
          message,
          sharing: sharingId,
          user: friendId || author,
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
    async createNewAnnouncement({ request }, { input }) {
      const userId = request.user.id;
      const {
        message,
        description,
        privacy,
        apartments,
        buildingId,
      } = input;
      const apts = apartments.map(toObjectId);
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
        message,
        description,
        privacy,
        date: new Date(),
        building: buildingId,
        apartments: apts,
      };
      const r = await AnnouncementsModel.create(announcement);
      let us = await ApartmentsModel.aggregate([
        {
          $match: {
            _id: {
              $in: apts,
            },
          },
        },
        {
          $unwind: '$users',
        },
        {
          $project: {
            users: 1,
          },
        },
      ]);
      us = us.map(i => i.users);
      if (apts.length > 0) {
        sendNewAnnouncementNotification(us, r.id);
      }
      return r;
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
    async createDocument({ request }, { input }) {
      const isAdmin = await BuildingMembersModel.findOne({
        building: input.building,
        user: request.user.id,
        type: ADMIN,
      });

      if (!isAdmin) {
        throw new Error('you don\'t have permission to approve request');
      }

      return DocumentsService.create({
        ...input,
        author: request.user.id,
      });
    },
    async updateDocument({ request }, { input }) {
      const isAdmin = await BuildingMembersModel.findOne({
        building: input.building,
        user: request.user.id,
        type: ADMIN,
      });

      if (!isAdmin) {
        throw new Error('you don\'t have permission to approve request');
      }

      return DocumentsService.update({
        ...input,
        author: request.user.id,
      });
    },
    async deleteDocument({ request }, { input }) {
      const isAdmin = await BuildingMembersModel.findOne({
        building: input.building,
        user: request.user.id,
        type: ADMIN,
      });

      if (!isAdmin) {
        throw new Error('you don\'t have permission to approve request');
      }

      return DocumentsService.softDelete({
        ...input,
      });
    },
    async createFAQ({ request }, { input }) {
      const isAdmin = await BuildingMembersModel.findOne({
        building: input.building,
        user: request.user.id,
        type: ADMIN,
      });

      if (!isAdmin) {
        throw new Error('you don\'t have permission to approve request');
      }

      return FAQsService.create({
        ...input,
        author: request.user.id,
      });
    },
    async updateFAQ({ request }, { input }) {
      const isAdmin = await BuildingMembersModel.findOne({
        building: input.building,
        user: request.user.id,
        type: ADMIN,
      });

      if (!isAdmin) {
        throw new Error('you don\'t have permission to approve request');
      }

      return FAQsService.update({
        ...input,
        author: request.user.id,
      });
    },
    async deleteFAQ({ request }, { input }) {
      const isAdmin = await BuildingMembersModel.findOne({
        building: input.building,
        user: request.user.id,
        type: ADMIN,
      });

      if (!isAdmin) {
        throw new Error('you don\'t have permission to approve request');
      }

      return FAQsService.softDelete({
        ...input,
      });
    },
    async approvingUserToBuilding({ request }, { input }) {
      // main process
      const { requestsToJoinBuildingId } = input;
      if (!requestsToJoinBuildingId) {
        throw new Error('request id is required');
      }

      const record = await BuildingMembersModel.findOne({ _id: requestsToJoinBuildingId });
      if (!record) {
        throw new Error('not found the request');
      }

      // Determine whether building already exists yet.
      if (!(await BuildingsModel.findOne({ _id: record.building }))) {
        throw new Error('Building not found.');
      }

      // Determine whether user already exists yet.
      const userDocument = await UsersModel.findOne({ _id: record.user });
      if (!userDocument) {
        throw new Error('User not found.');
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
      // Get all BOMs
      const BOMs = await BuildingMembersModel.distinct('user', {
        building: record.building,
        type: ADMIN,
        status: ACCEPTED,
        user: {
          $nin: [request.user.id],
        },
      });

      // Notify to BOMs
      if (BOMs) {
        BOMs.push(userDocument._id);
        await acceptedUserBelongsToBuildingNotification(userDocument._id, BOMs);
      }

      // Sending email
      if (isObject(userDocument.emails) && isString(userDocument.emails.address)) {
        await BuildingServices.notifywhenAcceptedForUserBelongsToBuilding(userDocument.emails.address, userDocument);
      }

      return {
        request: BuildingMembersModel.findOne({ _id: requestsToJoinBuildingId }),
      };
    },
    async rejectingUserToBuilding({ request }, { input }) {
      // main proccess
      const { requestsToJoinBuildingId, message } = input;

      if (!requestsToJoinBuildingId) {
        throw new Error('request id is required');
      }

      if (!message) {
        throw new Error('reject message is required');
      }

      const record = await BuildingMembersModel.findOne({ _id: requestsToJoinBuildingId });
      if (!record) {
        throw new Error('not found the request');
      }

      // Determine whether building already exists yet.
      if (!(await BuildingsModel.findOne({ _id: record.building }))) {
        throw new Error('Building not found.');
      }

      // Determine whether user already exists yet.
      const userDocument = await UsersModel.findOne({ _id: record.user });
      if (!userDocument) {
        throw new Error('User not found.');
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
          message,
          status: REJECTED,
        },
      });

      // Send email and notification to user status ACCEPTED
      // Get all BOMs
      const BOMs = await BuildingMembersModel.distinct('user', {
        building: record.building,
        type: ADMIN,
        status: ACCEPTED,
        user: {
          $nin: [request.user.id],
        },
      });

      // Notify to BOMs
      if (BOMs) {
        BOMs.push(userDocument._id);
        await rejectedUserBelongsToBuildingNotification(userDocument._id, BOMs);
      }
      // Sending email
      if (isObject(userDocument.emails) && isString(userDocument.emails.address)) {
        await BuildingServices.notifywhenRejectedForUserBelongsToBuilding(userDocument.emails.address, userDocument);
      }

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
    async updateFeeDetail({ request }, { input }) {
      const { feeId, total, status, buildingId } = input;
      const record = await FeeModel.findOne({ _id: feeId });
      if (!record) {
        throw new Error('not found the fee');
      }
      const isAdmin = await BuildingMembersModel.findOne({
        building: buildingId,
        user: request.user.id,
        type: ADMIN,
      });
      if (!isAdmin) {
        throw new Error('you don\'t have permission to update fee detail');
      }
      await FeeModel.update({
        _id: feeId,
      }, {
        $set: {
          total,
          status,
        },
      });

      return {
        fee: await FeeModel.findOne({
          _id: feeId,
        }),
      };
    },
    async reminderToPayFee({ request }, { input: { _id, apartment, building } }) {
      // Determine whether user has granted to perform this action.
      const isAdmin = await BuildingMembersModel.findOne({
        building,
        user: request.user.id,
        type: ADMIN,
      });

      if (!isAdmin) {
        throw new Error('you don\'t have permission to update fee detail.');
      }

      // Determine whether the fee already exists.
      const feeDoc = await FeeModel.findOne({
        _id,
        apartment,
        building,
      });
      if (!feeDoc) {
        throw new Error('The fee does not exists.');
      }

      // Determine whether the apartment already exists.
      const apartmentDoc = await ApartmentsModel.findOne({
        _id: apartment,
      });
      if (!apartmentDoc) {
        throw new Error('The apartment does not exists.');
      }

      // Determine whether the building already exists.
      const buildingDoc = await BuildingsModel.findOne({
        _id: building,
      });
      if (!buildingDoc) {
        throw new Error('The building does not exists.');
      }

      sendNewFeeForApartmentNotification({
        apartment: feeDoc.apartment,
        month: feeDoc.month,
        year: feeDoc.year,
        text: `Thông báo nộp tiền ${feeDoc.type.name.toString().toLowerCase()} tháng ${feeDoc.month}/${feeDoc.year}`,
      });

      return feeDoc;
    },
    async deleteAnnouncement({ request }, { _id, buildingId }) {
      const isAdmin = await BuildingMembersModel.findOne({
        building: buildingId,
        user: request.user.id,
        type: ADMIN,
      });

      if (!isAdmin) {
        throw new Error('you don\'t have permission to delete announcement.');
      }

      const announcementDoc = await AnnouncementsModel.findOne({ _id });
      if (!announcementDoc) {
        throw new Error('The announcement does not exists.');
      }
      await AnnouncementsModel.update(
        {
          _id,
        },
        {
          $set: {
            isDeleted: true,
          },
        },
      );
      await NotificationsModel.remove({
        data: {
          announcement: _id,
        },
      });
      return announcementDoc;
    },
    async editAnnouncement({ request }, { input }) {
      const {
        _id,
        message,
        description,
        privacy,
        apartments,
      } = input;
      let announcementDoc = await AnnouncementsModel.findOne({ _id });
      if (!announcementDoc) {
        throw new Error('The announcement does not exists.');
      }

      const apts = apartments.map(toObjectId);
      const isAdmin = await BuildingMembersModel.findOne({
        building: announcementDoc.building,
        user: request.user.id,
        type: ADMIN,
      });
      if (!isAdmin) {
        throw new Error('you don\'t have permission to edit announcement.');
      }

      await AnnouncementsModel.update(
        { _id },
        {
          $set: {
            message,
            description,
            privacy,
            apartments: apts,
          },
        },
      );

      const notificationDoc = await NotificationsModel.find({
        data: {
          announcement: _id,
        },
      });
      if (notificationDoc.length > 0) {
        await NotificationsModel.remove({
          data: {
            announcement: _id,
          },
        });
      }
      if (privacy === PRIVATE && apts.length > 0) {
        let us = await ApartmentsModel.aggregate([
          {
            $match: {
              _id: {
                $in: apts,
              },
            },
          },
          {
            $unwind: '$users',
          },
          {
            $project: {
              users: 1,
            },
          },
        ]);
        us = us.map(i => i.users);
        sendNewAnnouncementNotification(us, _id);
      }
      announcementDoc = await AnnouncementsModel.findOne({ _id });
      return announcementDoc;
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
