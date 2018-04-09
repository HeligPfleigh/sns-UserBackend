import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import isUndefined from 'lodash/isUndefined';
import isObject from 'lodash/isObject';
import isString from 'lodash/isString';
import merge from 'lodash/merge';
import isNumber from 'lodash/isNumber';
import isBoolean from 'lodash/isBoolean';
import isDate from 'lodash/isDate';
import isNull from 'lodash/isNull';
import map from 'lodash/map';
import includes from 'lodash/includes';
import without from 'lodash/without';
import isFunction from 'lodash/isFunction';
import forEach from 'lodash/forEach';
import uniqWith from 'lodash/uniqWith';
import mongoose from 'mongoose';
import { generate as keyRandom } from 'shortid';
import {
  // buildSchemaFromTypeDefinitions,
  makeExecutableSchema,
} from 'graphql-tools';
import XLSX from 'xlsx';
import moment from 'moment';
import { PubSub, withFilter } from 'graphql-subscriptions';
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
import ApartmentServices from './apis/ApartmentServices';
import AddressServices from './apis/AddressServices';
import BuildingServices from './apis/BuildingServices';
import NotificationsService from './apis/NotificationsService';
import UsersService from './apis/UsersService';
import PostsService from './apis/PostsService';
import * as DocumentsService from './apis/DocumentsService';
import * as FAQsService from './apis/FAQsService';
import CommentService from './apis/CommentService';
import EventService from './apis/EventServices';
import BuildingSettingsService from './apis/BuildingSettingsService';
import {
  // saveFeeForApartments,
  getFeeTypes,
} from './apis/FeeServices';
import {
  sendDeletedEventNotification,
  acceptedUserBelongsToBuildingNotification,
  rejectedUserBelongsToBuildingNotification,
  sendSharingPostNotification,
  sendNewAnnouncementNotification,
  sendRemindFeeNotification,
  sendCancelledEventNotification,
} from '../utils/notifications';
import { schema as schemaType, resolvers as resolversType } from './types';
import {
  ADMIN, PENDING, REJECTED, ACCEPTED, PUBLIC, PRIVATE, FRIEND, ONLY_ME, EVENT, PAID, UNPAID, PARTIALLY_PAID,
  POST_ADDED_SUBSCRIPTION, NOTIFICATION_ADDED_SUBSCRIPTION, COMMENT_ADDED_SUBSCRIPTION,
} from '../constants';
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
export const pubsub = new PubSub();

const rootSchema = [`

type Test {
  hello: String
}

type Auth {
  id_token: String!
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
  apartmentsOfBuilding(buildingId: String!): [Apartment]
  apartmentsOfUserByBuilding(buildingId: String!): [Apartment]
  building(_id: String): Building
  buildings(query: String, limit: Int): [Building]
  notification(_id: String): Notification
  comment(_id: String): Comment
  notifications(limit: Int, cursor: String): NotificationsResult
  search(keyword: String!, numberOfFriends: Int): [User]
  event(_id: String!): Event
  resident(_id: String): User
  requestsToJoinBuilding(_id: String): RequestsToJoinBuilding
  checkExistUser(userId: String, query: String): Boolean
  documents(building: String!, limit: Int, page: Int): Documents
  FAQs(building: String!, limit: Int, page: Int): FAQs
  fee(_id: String!): Fee
  residentsInBuilding(building: String!, limit: Int, page: Int): ResidentsInBuildingPayload
  residentsInBuildingGroupByApartment(building: String!, filters: SearchByResidentsInBuildingGroupByApartment, limit: Int, page: Int): ResidentsInBuildingGroupByApartmentPayload
  announcement(_id: String!): Announcement,
  getBOMList(buildingId: String!): [User]
  getBuildingSettings(building: String!): BuildingSettingPayload
  codePasswordValidator(username: String!, code: String!): Boolean
  forgotPassword(email: String!): Boolean
}

input SearchByResidentsInBuildingGroupByApartment {
  resident: String
  apartment: String
}

input ProfileInput {
  picture: String
  firstName: String
  lastName: String
  gender: String
  dob: Date
  address: String
}

input EmailInput {
  address: String!
  verified: Boolean
}

input PhoneInput {
  number: String!
  verified: Boolean
}

input UpdateUserInput {
  phone: PhoneInput!
  email: EmailInput!
  profile: ProfileInput!
}

input UpdateUserInputRequest {
  userId: String!
  userData: UpdateUserInput!
}

input PasswordInput {
  value: String!
  counter: Int
  code: String
  updatedAt: Date
}

input CreateUserInput {
  apartments: [String!]
  building: String!
  email: EmailInput!
  password: PasswordInput!
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

input DeleteResidentInBuildingInput {
  resident: String!
  apartment: String!
  building: String!
}

input ExportResidentsInBuildingGroupByApartmentInput {
  building: String!
}

type UploadMultiFileResponse {
  files: [UploadFileResponse]!
}

input BuildingSettingsInput {
  fee: BuildingFeeSettingInput
}

input BuildingFeeSettingInput {
  automatedReminderAfterHowDays: Int
  timeLimitationBetween2FeeNotifications: Int
}

type Mutation {
  login(
    account: String!
    password: String!
  ): Auth!
  loginWithFacebook(
    token: String!
  ): Auth!
  uploadSingleFile(
    file: Upload!
  ): UploadSingleFileResponse!
  uploadMultiFile(
    files: [Upload!]!
  ): UploadMultiFileResponse!
  acceptFriend (
    _id: String!
  ): User
  rejectFriend (
    _id: String!
  ): User
  sendFriendRequest(
    _id: String!
  ): User
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
    isMobile: Boolean
  ): Comment
  createNewPost (
    message: String!
    userId: String
    privacy: PrivacyType
    photos: [String]
    isMobile: Boolean
  ): Post
  editPost (
    _id: String!
    message: String!
    photos: [String]
    isMobile: Boolean
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
  addNewResident(
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
  disInterestEvent(
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
    input: UpdateUserInputRequest!
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
  deleteResidentInBuilding(
    input: DeleteResidentInBuildingInput!
  ): User
  exportResidentsInBuildingGroupByApartment(
    building: String!,
    filters: SearchByResidentsInBuildingGroupByApartment
  ): ExportResidentsInBuildingGroupByApartmentPayload
  deleteAnnouncement(
    _id: String!
  ): Announcement
  editAnnouncement(
    input: EditAnnouncementInput!
  ): Announcement
  saveBuildingSettings(
    building: String!,
    input: BuildingSettingsInput!
  ): BuildingSettingPayload
  cancelEvent(
    eventId: String!
  ): Event
  changeUserPassword(
    username: String!,
    password: String!,
    oldPassword: String
  ): Boolean
  cancelFriendRequested(
    _id: String!
  ): User
  sendUnfriendRequest(
    _id: String!
  ): User
}

type Subscription {
  commentAdded(postID: String!, commentID: String): Comment
  postAdded: Post
  notificationAdded: Notification
}

schema {
  query: Query
  mutation: Mutation
  subscription: Subscription
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
            {
              author: { $in: friendListByIds },
              user: userId,
              privacy: { $in: [ONLY_ME] },
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
      return BuildingServices.getBOMOfBuilding(buildingId);
    },
    async getBuildingSettings({ request }, { building }) {
      // Determine whether user has granted to perform this action.
      const isAdmin = await BuildingMembersModel.findOne({
        building: toObjectId(building),
        user: request.user.id,
        type: ADMIN,
      });

      if (!isAdmin) {
        throw new Error('you don\'t have permission to get settings in this building.');
      }

      // check if announcement and building exist
      const buildingDoc = await BuildingsModel.findOne(
        {
          _id: building,
        },
      );
      if (!buildingDoc) {
        throw Error('The building does not exists.');
      }

      const buildingSettings = await BuildingSettingsService.Model.findOne({ building });
      return buildingSettings;
    },
    async documents(_, { building, limit = 20, page = 1 }) {
      const r = await DocumentsService.service({ limit }).findBySkip({
        query: {
          building,
          isDeleted: { $exists: false },
          $sort: {
            createdAt: -1,
          },
          $skip: Math.abs(page - 1) * limit,
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

      // if (isUndefined(filters.month)) {
      //   const { month, year } = await FeeModel.findOne({
      //   }).sort({
      //     month: -1,
      //     year: -1,
      //   }).select('month year');

      //   filters = {
      //     ...filters,
      //     month,
      //     year,
      //   };
      // }

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

      const count = (await FeeModel.aggregate([...options]).cursor({ async: true }).exec()).length;

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
      ]).cursor({ async: true }).exec();

      const data = await Promise.all((result || []).map(async (item) => {
        const detail = await FeeModel.find({
          ...item._id,
          'type.code': (feeType && (feeType !== 0)) ? feeType : { $exists: true },
        });
        return { ...item._id, totals: item.totals, detail };
      }));

      return data;
    },
    async residentsInBuilding({ request }, { building, limit = 20, page = 1 }) {
      // Determine whether user has granted to perform this action.
      const isAdmin = await BuildingMembersModel.findOne({
        building: toObjectId(building),
        user: request.user.id,
        type: ADMIN,
      });

      if (!isAdmin) {
        throw new Error('you don\'t have permission to get all residents in this building.');
      }

      const $skip = Math.abs(page - 1) * limit;
      const { aggregate, queryStats, hasData } = await ApartmentServices.residentsInBuildingGroupByApartmentQuery({
        building,
        resident: null,
        apartment: null,
      });

      let queryTable = [];
      let hasNextPage = false;
      let total = 0;
      if (hasData) {
        // Get remaining data
        const remainingData = (queryStats.numberOfResidents - $skip);
        hasNextPage = remainingData > limit;
        total = queryStats.numberOfResidents;

        // If remaining data is empty, ignore query below
        if (remainingData > 0) {
          queryTable = await ApartmentsModel.aggregate([
            ...aggregate,
            {
              $unwind: '$residents',
            },
            {
              $group: {
                _id: '$residents._id',
                apartment: {
                  $first: '$_id',
                },
                building: {
                  $first: '$building',
                },
                user: {
                  $first: '$residents',
                },
              },
            },
            {
              $skip,
            },
            {
              $limit: limit,
            },
          ]).cursor({ async: true }).exec();
        }
      }

      // Response
      return {
        pageInfo: {
          limit,
          page,
          hasNextPage,
          total,
        },
        edges: queryTable,
      };
    },
    async residentsInBuildingGroupByApartment({ request }, { building, filters: { resident, apartment }, limit = 20, page = 1 }) {
      // Determine whether user has granted to perform this action.
      const isAdmin = await BuildingMembersModel.findOne({
        building: toObjectId(building),
        user: request.user.id,
        type: ADMIN,
      });

      if (!isAdmin) {
        throw new Error('you don\'t have permission to get all residents in this building.');
      }

      const $skip = Math.abs(page - 1) * limit;
      const { aggregate, queryStats, hasData } = await ApartmentServices.residentsInBuildingGroupByApartmentQuery({
        building,
        resident,
        apartment,
      });

      let queryTable = [];
      let hasNextPage = false;
      let total = 0;
      if (hasData) {
        // Get remaining data
        const remainingData = (queryStats.numberOfApartments - $skip);
        hasNextPage = remainingData > limit;
        total = queryStats.numberOfApartments;

        // If remaining data is empty, ignore query below
        if (remainingData > 0) {
          queryTable = await ApartmentsModel.aggregate([
            ...aggregate,
            {
              $skip,
            },
            {
              $limit: limit,
            },
          ]).cursor({ async: true }).exec();
        }
      }

      // Response
      return {
        pageInfo: {
          limit,
          page,
          hasNextPage,
          total,
        },
        edges: queryTable,
        stats: queryStats,
      };
    },
    apartment(root, { _id }) {
      return AddressServices.getApartment(_id);
    },
    apartmentsOfBuilding(root, { buildingId }) {
      return AddressServices.getApartmentsOfBuilding(buildingId);
    },
    apartmentsOfUserByBuilding({ request }, { buildingId }) {
      const userId = request.user.id;
      return AddressServices.getApartmentsOfBuilding(userId, buildingId);
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

      if (keyword.toLowerCase() === 'a') {
        const r = await UsersModel.find({
          _id: { $nin: [u._id] },
          building: u.building,
          $or: [{
            'profile.firstName': new RegExp(keyword, 'i'),
          }, {
            'profile.lastName': new RegExp(keyword, 'i'),
          }, {
            search: new RegExp(keyword, 'i'),
          }],
        }).limit(numberOfFriends);
        return r;
      }

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
    checkExistUser(root, params) {
      return UsersService.checkExistUser(params);
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
    codePasswordValidator(root, params) {
      return UsersService.codePasswordValidator(params);
    },
    forgotPassword(root, { email }) {
      return UsersService.forgotPassword(email);
    },
  },
  Mutation: {
    login(_, args) {
      return UsersService.login(args);
    },
    loginWithFacebook(_, args) {
      return UsersService.loginWithFacebook(args);
    },
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
    async createNewEvent({ request: { user } }, { input }) {
      const { building, privacy, photos, name, location, start, end, message, invites } = input;
      return EventService.createEvent({ building, privacy, author: user.id, photos, name, location, start, end, message, invites });
    },
    async interestEvent({ request }, { eventId }) {
      return EventService.interestEvent(request.user.id, eventId);
    },
    async disInterestEvent({ request }, { eventId }) {
      return EventService.disInterestEvent(request.user.id, eventId);
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
    createNewComment({ request }, { _id, message, commentId, isMobile }) {
      return CommentService.createNewComment(request.user.id, _id, message, commentId, isMobile);
    },
    createNewPost({ request }, { message, userId, privacy = PUBLIC, photos, isMobile }) {
      // NOTE:
      // userId: post on friend wall
      if (!message.trim()) {
        throw new Error('you can not create a new post with empty message');
      }
      const author = request.user.id;
      userId = userId || author;
      // pubsub.publish('commentAdded', { commentAdded: { id: 1, content: 'Hello!' } });
      return PostsService.createNewPost(author, message, userId, privacy, photos, isMobile);
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
      const { user: newUser } = await UsersService.newRegisteredUser(user);
      return newUser;
    },
    async addNewResident(root, { user }) {
      const { user: newUser } = await UsersService.addNewResident(user);
      return newUser;
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
    async editPost(root, { _id, message, photos, privacy = PUBLIC, isDelPostSharing = true, isMobile = false }) {
      return PostsService.editPost(_id, message, photos, privacy, isDelPostSharing, isMobile);
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
      const { userId } = input;
      if (request.user.id !== userId) {
        // throw new Error('Người dùng chưa đăng nhập.');
      }
      return {
        user: await UsersService.updateUserProfile(input),
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
      ]).cursor({ async: true }).exec();
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
        throw new Error('you don\'t have permission to create document');
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
        throw new Error('you don\'t have permission to update document');
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
        throw new Error('you don\'t have permission to delete document');
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
        throw new Error('you don\'t have permission to create FAQ');
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
        throw new Error('you don\'t have permission to update FAQ');
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
        throw new Error('you don\'t have permission to delete FAQ');
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
      const buildingDoc = await BuildingsModel.findOne({ _id: record.building });
      if (!buildingDoc) {
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

      // update users joined apartments
      const { requestInformation: { apartments } } = record;
      if (isEmpty(apartments)) {
        throw new Error('User don\'t provided apartment info. Request rejected');
      }

      await (apartments || []).map(async (apartmentId) => {
        const doc = await ApartmentsModel.findById(apartmentId);
        if (doc) {
          // if the first user register into apartment
          doc.owner = doc.owner || record.user;

          // and push new user into array value users field
          (doc.users || []).push(record.user);
          doc.users = uniqWith((doc.users || []), isEqual);

          // Save update object
          await doc.save();
        }
      });

      // NOTE: what happens if we lost connection to db
      await BuildingMembersModel.update({
        _id: requestsToJoinBuildingId,
      }, {
        $set: {
          status: ACCEPTED,
        },
      });

      // set user active
      // if (userDocument.email.verified) {
      // }
      await UsersModel.findByIdAndUpdate(record.user, { status: 1 });

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
      if (isObject(userDocument.email) && isString(userDocument.email.address)) {
        await BuildingServices.notifywhenAcceptedForUserBelongsToBuilding(userDocument.email.address, userDocument);
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
      const buildingDoc = await BuildingsModel.findOne({ _id: record.building });
      if (!buildingDoc) {
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
          let apartment = null;
          await (apartments || []).map(async (apartmentId) => {
            apartment = await ApartmentsModel.findById(apartmentId);
            if (apartment) {
              // clear owner
              if (isEqual(apartment.owner.toString(), record.user.toString())) {
                apartment.owner = null;
              }
              // clear userId in users field
              if (apartment.users && !isEmpty(apartment.users)) {
                apartment.users.remove(record.user);
              }
              await apartment.save();
            }
          });
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
      if (isObject(userDocument.email) && isString(userDocument.email.address)) {
        await BuildingServices.notifywhenRejectedForUserBelongsToBuilding(
          userDocument.email.address, {
            ...userDocument.toObject(),
            message,
            building: buildingDoc.toObject(),
          },
        );
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
    async exportResidentsInBuildingGroupByApartment({ request }, { building, filters: { resident, apartment } }) {
      // Determine whether user has granted to perform this action.
      const isAdmin = await BuildingMembersModel.findOne({
        building: toObjectId(building),
        user: request.user.id,
        type: ADMIN,
      });

      if (!isAdmin) {
        throw new Error('you don\'t have permission to all residents in this building.');
      }

      // Determine whether the building already exists.
      const buildingDoc = await BuildingsModel.findOne({
        _id: building,
      });
      if (!buildingDoc) {
        throw new Error('The building does not exists.');
      }

      const { aggregate, queryStats, hasData } = await ApartmentServices.residentsInBuildingGroupByApartmentQuery({
        building,
        resident,
        apartment,
      });

      const fileName = `public/uploads/ExportResidentsInBuildingGroupByApartment.${moment().unix()}.xlsx`;
      const url = `${request.secure ? 'https' : 'http'}://${request.headers.host}/${fileName}`;

      const createExcelFile = (params) => {
        const { columns, data, name, merges, heading } = params;
        const dataset = [];
        const config = {
          cols: [],
        };

        const datenum = (v, date1904) => {
          if (date1904) v += 1462;
          const epoch = Date.parse(v);
          return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
        };

        if (Array.isArray(heading)) {
          forEach(heading, (item) => {
            dataset.push(item);
          });
        }

        const header = [];
        forEach(columns, (item) => {
          header.push(item.displayName);

          if (item.width) {
            if (Number.isInteger(item.width)) {
              config.cols.push({
                wpx: item.width,
              });
            } else if (Number.isInteger(parseInt(item.width, 10))) {
              config.cols.push({
                wch: item.width,
              });
            } else {
              throw new Error('Provide column width as a number');
            }
          } else {
            config.cols.push({});
          }
        });

        if (header.length > 0) {
          dataset.push(header);
        }

        forEach(data, (record) => {
          const items = [];
          forEach(columns, (item, key) => {
            let cellValue = record[key];
            if (item.cellFormat && isFunction(item.cellFormat)) {
              cellValue = item.cellFormat(cellValue, record);
            } else if (item.cellStyle && isFunction(item.cellStyle)) {
              cellValue = {
                value: cellValue,
                style: item.cellStyle(cellValue, record),
              };
            } else if (item.cellStyle) {
              cellValue = {
                value: cellValue,
                style: item.cellStyle,
              };
            }
            items.push(cellValue);
          });

          if (items.length > 0) {
            dataset.push(items);
          }
        });

        const wb = {
          SheetNames: [],
          Sheets: {},
        };
        const ws = {};
        const range = {
          s: {
            c: 10000000,
            r: 10000000,
          },
          e: {
            c: 0,
            r: 0,
          },
        };

        wb.SheetNames.push(name);

        for (let R = 0; R !== (dataset.length); ++R) {
          for (let C = 0; C !== dataset[R].length; ++C) {
            if (range.s.r > R) {
              range.s.r = R;
            }

            if (range.s.c > C) {
              range.s.c = C;
            }

            if (range.e.r < R) {
              range.e.r = R;
            }

            if (range.e.c < C) {
              range.e.c = C;
            }

            let cell;
            if (dataset[R][C] && isObject(dataset[R][C]) && dataset[R][C].style && !isDate(dataset[R][C])) {
              cell = {
                v: dataset[R][C].value,
                s: dataset[R][C].style,
              };
            } else {
              cell = {
                v: dataset[R][C],
              };
            }

            if (isNull(cell.v)) {
              /* eslint-disable */
              continue;
            }

            const cellRef = XLSX.utils.encode_cell({
              c: C,
              r: R,
            });
            if (isNumber(cell.v)) {
              cell.t = 'n';
            } else if (isBoolean(cell.v)) {
              cell.t = 'b';
            } else if (isDate(cell.v)) {
              cell.t = 'n';
              cell.z = XLSX.SSF._table[14];
              cell.v = datenum(cell.v);
            } else {
              cell.t = 's';
            }

            ws[cellRef] = cell;
          }
        }

        if (merges) {
          if (!ws['!merges']) ws['!merges'] = [];
          merges.forEach((item) => {
            ws['!merges'].push({
              s: {
                r: item.start.row - 1,
                c: item.start.column - 1,
              },
              e: {
                r: item.end.row - 1,
                c: item.end.column - 1,
              },
            });
          });
        }

        if (range.s.c < 10000000) {
          ws['!ref'] = XLSX.utils.encode_range(range);
        }

        wb.Sheets[name] = ws;
        if (config.cols) {
          wb.Sheets[name]['!cols'] = config.cols;
        }

        return XLSX.writeFile(wb, `${__dirname}/${fileName}`);
      };

      if (hasData) {
        const heading = [
          [
            'Tòa nhà',
            buildingDoc.name,
          ],
          [
            'Địa chỉ',
            `${buildingDoc.address.basisPoint}, ${buildingDoc.address.street}, ${buildingDoc.address.ward}, ${buildingDoc.address.district}, ${buildingDoc.address.province}, ${buildingDoc.address.country}`,
          ],
          [
            'Tổng số căn hộ',
            queryStats.numberOfApartments,
          ],
          [
            'Tống số cư dân',
            queryStats.numberOfResidents,
          ]
        ];

        const columns = {
          apartmentName: {
            displayName: 'Căn hộ',
            width: 120,
          },
          residentName: {
            displayName: 'Cư dân',
            width: 200,
          },
          residentRole: {
            displayName: 'Vai trò',
            width: 120,
          },
        };

        const merges = [
          {
            start: {
              row: 1,
              column: 2,
            },
            end: {
              row: 1,
              column: 3,
            },
          },
          {
            start: {
              row: 2,
              column: 2,
            },
            end: {
              row: 2,
              column: 3,
            },
          },
        ];

        const data = [];
        heading.push.call(heading, [], [
          ' ',
          'Danh sách cư dân trong các căn hộ'
        ], []);

        const queryTable = await ApartmentsModel.aggregate(aggregate).cursor({ async: true }).exec();
        queryTable.forEach(row => {
          const numberOfResidents = Array.isArray(row.residents) ? row.residents.length : 0;
          data.push({
            apartmentName: row.name,
            // residentName: `Tổng số cư dân ${numberOfResidents}`
          });

          if (numberOfResidents > 0) {
            row.residents.forEach(resident => {
              data.push({
                residentName: [resident.profile.firstName, resident.profile.lastName].join(' '),
                residentRole: resident._id.equals(row.owner) ? 'Chủ hộ' : 'Người thuê nhà',
              });
            });
          }
        });

        try {
          createExcelFile({
            name: `Cư dân`,
            heading,
            merges,
            columns,
            data,
          });
        } catch (e) {
          throw new Error('Có lỗi trong quá trình tạo tập tin.');
        }
      }

      return {
        file: url,
      };
    },
    async deleteResidentInBuilding({ request }, { input: { resident, apartment, building } }) {
      // Determine whether user has granted to perform this action.
      const isAdmin = await BuildingMembersModel.findOne({
        building,
        user: request.user.id,
        type: ADMIN,
      });

      if (!isAdmin) {
        throw new Error('you don\'t have permission to delete this resident.');
      }

      // Determine whether the fee already exists.
      const userDoc = await UsersModel.findOne({
        _id: resident,
      });

      if (!userDoc) {
        throw new Error('The user does not exists.');
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

      const conditions = {
        $pull: {
          users: resident,
        },
      };

      if (apartmentDoc.owner && apartmentDoc.owner.toString() === resident) {
        conditions.$unset = {
          owner: 1,
        };
      }

      await ApartmentsModel.findByIdAndUpdate(apartment, conditions);

      // Determine whether the user still already exists in other apartment of this building.
      const residentStillAlreadyExists = await ApartmentsModel.find({
        $or: [
          {
            users: resident
          },
          {
            owner: resident
          }
        ]
      });

      // If not existing, the resident will be removed from this building.
      if (residentStillAlreadyExists.length === 0) {
        await BuildingMembersModel.remove({
          user: resident,
          building,
        });

        await UsersModel.findByIdAndUpdate(resident, {
          $unset: {
            building: 1,
          },
        });
      }

      return userDoc;
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
      // if it exits change latestReminder to now
      const now = moment();
      let feeDoc = await FeeModel.findOne({
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

      const buildingSettings = await BuildingSettingsService.Model.findOne({
        building,
      }).select('fee');

      if (buildingSettings.fee && feeDoc.latestReminder) {
        const { automatedReminderAfterHowDays } = buildingSettings.fee;
        const latestReminder = moment(feeDoc.latestReminder);
        if (automatedReminderAfterHowDays && now.clone().subtract(automatedReminderAfterHowDays, 'days') <= latestReminder) {
          throw new Error(`Lời nhắc nhở đã gửi tới căn hộ ${apartmentDoc.name} cách đây ${latestReminder.fromNow()}.`);
        }
      }

      feeDoc = await FeeModel.findOneAndUpdate({
        _id,
        apartment,
        building,
      }, {
          $set: {
            latestReminder: now.clone().endOf('day').toISOString(),
          },
        }, {
          new: true
        });

      sendRemindFeeNotification({
        apartment: feeDoc.apartment,
        month: feeDoc.month,
        year: feeDoc.year,
        text: `Lời nhắc nộp tiền ${feeDoc.type.name.toString().toLowerCase()} tháng ${feeDoc.month}/${feeDoc.year}`,
      });

      return feeDoc;
    },
    async deleteAnnouncement({ request }, { _id }) {
      const announcementDoc = await AnnouncementsModel.findOne({ _id });
      if (!announcementDoc) {
        throw new Error('Not found the announcement');
      }

      const isAdmin = await BuildingMembersModel.findOne({
        building: announcementDoc.building,
        user: request.user.id,
        type: ADMIN,
      });
      if (!isAdmin) {
        throw new Error('you don\'t have permission to delete announcement.');
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
    async saveBuildingSettings({ request }, { building, input }) {
      // Determine whether user has granted to perform this action.
      const isAdmin = await BuildingMembersModel.findOne({
        building: toObjectId(building),
        user: request.user.id,
        type: ADMIN,
      });

      if (!isAdmin) {
        throw new Error('you don\'t have permission to get settings in this building.');
      }

      // check if announcement and building exist
      const buildingDoc = await BuildingsModel.findOne(
        {
          _id: building,
        },
      );
      if (!buildingDoc) {
        throw Error('The building does not exists.');
      }

      const buildingSettings = await BuildingSettingsService.Model.findOneAndUpdate({
        building,
      }, {
          $set: {
            ...input,
          },
        }, {
          upsert: true,
          returnNewDocument: true,
        });

      return buildingSettings;
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
        throw new Error('Not found the announcement');
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
        ]).cursor({ async: true }).exec();
        us = us.map(i => i.users);
        sendNewAnnouncementNotification(us, _id);
      }
      announcementDoc = await AnnouncementsModel.findOne({ _id });
      return announcementDoc;
    },
    async cancelEvent({ request }, { eventId }) {
      let p = await PostsModel.findOne({
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
            isCancelled: true,
          },
        });
      sendCancelledEventNotification(p.joins, p._id, request.user.id);
      p = await PostsModel.findOne({ _id: eventId });
      return p;
    },
    changeUserPassword({ request }, params) {
      return UsersService.changePassword(params);
    },
    cancelFriendRequested({ request }, { _id }) {
      return UsersService.cancelFriendRequested(request.user.id, _id);
    },
    sendUnfriendRequest({ request }, { _id }) {
      return UsersService.sendUnfriendRequest(request.user.id, _id);
    },
  },
  Subscription: {
    postAdded: {
      subscribe: () => pubsub.asyncIterator(POST_ADDED_SUBSCRIPTION)
    },
    commentAdded: {
      subscribe: withFilter(() => pubsub.asyncIterator(COMMENT_ADDED_SUBSCRIPTION),
        (payload, variables) => {
          // if it is reply of a comment
          if(payload.commentAdded.reply != null){
            return (
              (payload.commentAdded.post == variables.postID) &&
              (payload.commentAdded.reply == variables.commentID)
            )
          }
          return payload.commentAdded.post == variables.postID;
        }
      )
    },
    notificationAdded: {
      subscribe: () => pubsub.asyncIterator(NOTIFICATION_ADDED_SUBSCRIPTION)
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
