import path from 'path';
import url from 'url';
import isEmpty from 'lodash/isEmpty';
import reduce from 'lodash/reduce';
import clone from 'lodash/clone';
import without from 'lodash/without';
import isEqual from 'lodash/isEqual';
import kebabCase from 'lodash/kebabCase';
import DateScalarType from './DateScalarType';
import {
  PostsModel,
  UsersModel,
  BuildingsModel,
  BuildingMembersModel,
  CommentsModel,
  ApartmentsModel,
  FriendsRelationModel,
  NotificationsModel,
  AnnouncementsModel,
  // FeeModel,
  // EventModel,
} from '../models';
import AddressServices from '../apis/AddressServices';
import {
  onlyMe,
} from '../../utils/authorization';
import toObjectId from '../../utils/toObjectId';
import {
  ADMIN,
  ACCEPTED,
  MEMBER,
  PENDING,
  PRIVATE,
  PUBLIC,
  FRIEND,
  ONLY_ME,
  ONLY_ADMIN_BUILDING,
  EVENT,
  BLOCKED,
} from '../../constants';
import Service from '../mongo/service';

export const schema = [`
# scalar types
scalar Date

# Interface
# An object with an ID.
interface Node {
  _id: ID!
}

interface PageInfo {
  total: Int
  limit: Int
  hasNextPage: Boolean
}

# Pagination
type PageInfoWithCursor implements PageInfo {
  endCursor: String
  hasNextPage: Boolean
  total: Int
  limit: Int
}

type PageInfoWithSkip implements PageInfo {
  skip: Int
  hasNextPage: Boolean
  total: Int
  limit: Int
}

type PageInfoWithCursorAndSkip implements PageInfo {
  endCursor: String
  skip: Int
  hasNextPage: Boolean
  total: Int
  limit: Int
}

type BuildingSettingPayload {
  fee: BuildingFeeSettingPayload
}

type BuildingFeeSettingPayload {
  recommendedDatePayFee: Int
  automatedDateReminder: Int
  timeLimitationBetween2FeeNotifications: Int
}

type PageInfoWithActivePage implements PageInfo {
  page: Int
  hasNextPage: Boolean
  total: Int
  limit: Int
}

type Apartment implements Node {
  _id: ID!
  number: Int
  building: Building
  announcements(cursor: String, limit: Int): BuildingAnnouncementConnection!
  users: [Author]
  owner: Author
  isOwner: Boolean
  prefix: String
  name: String
  createdAt: Date
  updatedAt: Date
}

enum NotificationType {
  LIKES
  COMMENTS
  NEW_POST
  ACCEPTED_FRIEND
  FRIEND_REQUEST
  EVENT_INVITE
  JOIN_EVENT
  CAN_JOIN_EVENT
  CANT_JOIN_EVENT
  EVENT_DELETED
  ACCEPTED_JOIN_BUILDING
  REJECTED_JOIN_BUILDING
  SHARING_POST
  INTEREST_EVENT
  DISINTEREST_EVENT
  NEW_FEE_APARTMENT
  NEW_ANNOUNCEMENT
  REMIND_FEE
}

enum PrivacyType {
  PUBLIC
  FRIEND
  ONLY_ME
  ONLY_ADMIN_BUILDING
}

enum PostType {
  STATUS
  EVENT
}

enum PrivacyEvent {
  PUBLIC_EVENT
  PRIVATE_EVENT
}

type Event implements Node {
  _id: ID!
  privacy: PrivacyType!
  author: Author
  building: Building
  photos: [String]
  name: String!
  location: String!
  start: Date!
  end: Date!
  message: String!
  invites: [Friend]
  interests: [Friend]
  joins: [Friend]
  can_joins: [Friend]
  cant_joins: [Friend]
  createdAt: Date
  updatedAt: Date
  isAuthor: Boolean
  isInterest: Boolean
}

type DataNotification {
  text: String
  year: Int
  month: Int
  apartment: String
  announcement: String
}

type Notification implements Node {
  _id: ID!
  user: Author!
  type: NotificationType!
  seen: Boolean
  isRead: Boolean
  subject: Post
  actors: [Author]
  data: DataNotification
  createdAt: Date
  updatedAt: Date
}

type Comment implements Node {
  _id: ID!
  message: String
  post: Post

  user: Author
  totalReply: Int
  reply: [Comment]
  parent: String

  createdAt: Date
  updatedAt: Date
}

type Post implements Node {
  _id: ID!
  message: String
  author: Author
  user: Friend
  building: Building
  totalLikes: Int
  totalComments: Int
  likes: [Author]
  comments( _id: String, limit: Int): [Comment]
  privacy: PrivacyType!
  type: PostType!
  isLiked: Boolean
  sharing: Post
  photos: [String]
  event: Event
  createdAt: Date
  updatedAt: Date
}

interface DocumentPayload {
  _id: ID!
  name: String
  file: String
  author: Friend
  building: Building
  createdAt: Date
  updatedAt: Date
  isDeleted: Boolean
}

type Document implements DocumentPayload, Node {
  _id: ID!
  name: String
  file: String
  author: Friend
  building: Building
  createdAt: Date
  updatedAt: Date
  isDeleted: Boolean
}

interface FAQPayload {
  _id: ID!
  name: String
  message: String
  author: Friend
  building: Building
  createdAt: Date
  updatedAt: Date
  isDeleted: Boolean
}

type FAQ implements FAQPayload, Node {
  _id: ID!
  name: String
  message: String
  author: Friend
  building: Building
  createdAt: Date
  updatedAt: Date
  isDeleted: Boolean
}

type Profile {
  fullName: String
  picture: String
  firstName: String
  lastName: String
  gender: String
}

interface Resident {
  _id: ID!
  username: String
  profile: Profile
  chatId: String
  phone: Phone
  emails: Email
  chatId: String
  posts: [Post]
  building: Building
  apartments: [Apartment]
}

type Me implements Node, Resident {
  _id: ID!
  username: String
  fullName: String
  phone: Phone
  emails: Email
  profile: Profile
  chatId: String
  isAdmin: Boolean
  posts: [Post]
  friends: [Friend]
  building: Building
  buildings: [Building]
  apartments: [Apartment]
  friendRequests: [Friend]
  friendSuggestions: [Friend]
  totalFriends: Int
  totalNotification: Int
  createdAt: Date
  updatedAt: Date
}

type Friend implements Node, Resident {
  _id: ID!
  username: String
  fullName: String
  phone: Phone
  emails: Email
  profile: Profile
  chatId: String
  posts: [Post]
  building: Building
  apartments: [Apartment]
  friends: [Friend]
  isFriend: Boolean
  requestInformation: UserRequestJoinBuildingInformation
  createdAt: Date
  updatedAt: Date
}

type UserRequestJoinApartmentInformation {
  _id: String!
  number: String
  name: String
  building: Building
}

type UserRequestJoinBuildingInformation {
  apartments: [UserRequestJoinApartmentInformation]
}

type Author implements Node, Resident {
  _id: ID!
  username: String
  phone: Phone
  emails: Email
  profile: Profile
  chatId: String
  posts: [Post]
  building: Building
  apartments: [Apartment]
  friends: [Resident]
  createdAt: Date
  updatedAt: Date
}


# Feeds
type Feeds {
  pageInfo: PageInfoWithCursor
  edges: [Post]
}

type Documents {
  pageInfo: PageInfoWithActivePage
  edges: [Document]
}

type FAQs {
  pageInfo: PageInfoWithActivePage
  edges: [FAQ]
}

type ResidentsInBuildingPayload {
  pageInfo: PageInfoWithActivePage
  edges: [ResidentsInBuildingData]
}

type ResidentsInBuildingData {
  apartment: String
  building: String
  user: User
}

type ResidentsInBuildingGroupByApartmentPayload {
  pageInfo: PageInfoWithActivePage
  edges: [ResidentsInBuildingGroupByApartmentData]
  stats: ResidentsInBuildingGroupByApartmentStats
}

type ResidentsInBuildingGroupByApartmentData implements Node {
  _id: ID!
  name: String
  number: String
  building: String
  owner: String
  residents: [User]
}

type ExportResidentsInBuildingGroupByApartmentPayload {
  _id: String!
  file: String
}

type ResidentsInBuildingGroupByApartmentStats {
  numberOfApartments: Int
  numberOfResidents: Int
}

type Events {
  pageInfo: PageInfoWithCursor
  edges: [Event]
}

type NotificationsResult {
  pageInfo: PageInfoWithCursor
  edges: [Notification]
}

### User Type
# Represents a user in system.
type Email {
  address: String
  verified: Boolean
}

type Phone {
  number: String
  verified: Boolean
}

type User implements Node {
  _id: ID!
  username: String
  profile: Profile
  chatId: String
  posts( cursor: String, limit: Int): PostConnection!
  friends( cursor: String, limit: Int): UserConnection!
  friendRequests( cursor: String, limit: Int): UserConnection!
  friendSuggestions( cursor: String, limit: Int): UserConnection!
  building: Building
  emails: Email
  phone: Phone
  apartments: [Apartment]
  announcements(announcementId: String, cursor: String, skip: Int, limit: Int): BuildingAnnouncementConnection!
  totalFriends: Int
  totalNotification: Int
  isFriend: Boolean
  createdAt: Date
  updatedAt: Date
}
type PostConnection {
  pageInfo: PageInfoWithCursor
  edges: [Post]
}
type UserConnection {
  pageInfo: PageInfoWithCursor
  edges: [User]
}

#FeeType
type FeeType implements Node {
  _id: ID!
  code: Int!
  name: String!
  icon: String
}

#Fee
type Fee implements Node {
  _id: ID!
  month: Int!
  year: Int!
  apartment: Apartment
  building: Building
  total: Int
  status: String
  from: Date!
  to: Date!
  type: FeeType
  detail: [Fee]
  totals: Int
  status: String
  createdAt: Date
  updatedAt: Date
  lastRemind: Date
}

type FeesResult {
  pageInfo: PageInfoWithSkip
  edges: [Fee]
}

### Building Type
# Represents a building in system.
type Address {
  basisPoint: String
  country: String
  province: String
  district: String
  ward: String
  street: String
  countryCode: String
}

type BuildingPostsConnection {
  pageInfo: PageInfoWithCursor
  edges: [Post]
}

type BuildingAnnouncementConnection {
  pageInfo: PageInfoWithCursorAndSkip
  edges: [Announcement]
}

type UsersAwaitingApprovalConnection {
  pageInfo: PageInfoWithCursor
  edges: [RequestsToJoinBuilding]
}

type Building implements Node {
  _id: ID!
  name: String
  display: String
  address: Address
  addressString: String
  isAdmin: Boolean
  apartments: [Apartment]
  totalApartment: Int
  announcements(skip: Int, limit: Int): BuildingAnnouncementConnection!
  requests(cursor: String, limit: Int): UsersAwaitingApprovalConnection
  posts(cursor: String, limit: Int): BuildingPostsConnection
  createdAt: Date
  updatedAt: Date
}

### RequestsToJoinBuilding Type
# Represents a request to join building in system.

type RequestInformation {
  apartments: [Apartment]
}

enum RequestsToJoinBuildingType {
  ADMIN
  MEMBER
}

enum RequestsToJoinBuildingStatus {
  PENDING
  ACCEPTED
  REJECTED
}

type RequestsToJoinBuilding implements Node {
  _id: ID!
  building: Building
  user: User
  type: RequestsToJoinBuildingType
  status: RequestsToJoinBuildingStatus
  requestInformation: RequestInformation
}

### Announcement Type
# Represents a announcement in system.
enum AnnouncementType {
  PUBLIC
  PRIVATE
}

type Announcement implements Node {
  _id: ID!
  date: Date
  message: String
  description: String
  privacy: AnnouncementType!
  building: Building
  apartments: [Apartment]
  createdAt: Date
  updatedAt: Date
}
`];

const PostsService = Service({
  Model: PostsModel,
  paginate: {
    default: 5,
    max: 10,
  },
  cursor: true,
});

const BuildingMembersService = Service({
  Model: BuildingMembersModel,
  paginate: {
    default: 10,
    max: 20,
  },
  cursor: true,
});

const UsersService = Service({
  Model: UsersModel,
  paginate: {
    default: 5,
    max: 10,
  },
  cursor: true,
});

const AnnouncementsServiceWithCursor = Service({
  Model: AnnouncementsModel,
  paginate: {
    default: 4,
    max: 10,
  },
  cursor: true,
});

const AnnouncementsServiceWithSkip = Service({
  Model: AnnouncementsModel,
  paginate: {
    default: 4,
    max: 10,
  },
});

// const ApartmentsService = Service({
//   Model: ApartmentsModel,
//   paginate: {
//     default: 5,
//     max: 10,
//   },
//   cursor: true,
// });

export const resolvers = {
  Date: DateScalarType,
  BuildingSettingPayload: {
    fee(data) {
      return data.fee;
    },
  },
  BuildingFeeSettingPayload: {
    recommendedDatePayFee({ recommendedDatePayFee }) {
      try {
        recommendedDatePayFee = parseInt(recommendedDatePayFee, 10);
      } catch (e) {
      }

      return isNaN(recommendedDatePayFee) ? null : recommendedDatePayFee;
    },
    automatedDateReminder({ automatedDateReminder }) {
      try {
        automatedDateReminder = parseInt(automatedDateReminder, 10);
      } catch (e) {
      }

      return isNaN(automatedDateReminder) ? null : automatedDateReminder;
    },
    timeLimitationBetween2FeeNotifications({ timeLimitationBetween2FeeNotifications }) {
      try {
        timeLimitationBetween2FeeNotifications = parseInt(timeLimitationBetween2FeeNotifications, 10);
      } catch (e) {
      }

      return isNaN(timeLimitationBetween2FeeNotifications) ? null : timeLimitationBetween2FeeNotifications;
    },
  },
  Profile: {
    fullName(profile) {
      return `${(profile && profile.firstName) || 'no'} ${(profile && profile.lastName) || 'name'}`;
    },
  },
  Building: {
    // @building
    display(building) {
      const address = building.address.toObject();
      return `${building.name}-${address.ward}, ${address.district}, ${address.province}`;
    },
    addressString: (building) => {
      const {
        address: {
          country,
          province,
          district,
          ward,
          street,
          basisPoint,
        },
      } = building;
      const pathString = (
        without(
          [basisPoint, street, ward, district, province, country],
          '',
          null,
          undefined,
        )
      ).join(', ');

      return pathString;
    },
    apartments(building) {
      return ApartmentsModel.find({ building: building._id });
    },
    totalApartment(building) {
      return ApartmentsModel.count({ building: building._id });
    },
    async posts(building, { cursor = null, limit = 5 }, { user }) {
      if (!user) {
        return {
          edges: [],
          pageInfo: {
            endCursor: null,
            hasNextPage: false,
          },
        };
      }
      const r = await BuildingMembersModel.findOne({
        user: user.id,
        building: building._id,
        status: ACCEPTED,
      });
      if (!r) {
        return {
          edges: [],
          pageInfo: {
            endCursor: null,
            hasNextPage: false,
          },
        };
      }
      const query = {
        building: building._id,
        isDeleted: { $exists: false },
        $sort: {
          createdAt: -1,
        },
        $limit: limit,
      };
      if (r.type === ADMIN) {
        query.$or = [
          {
            privacy: {
              $in: [PUBLIC, ONLY_ADMIN_BUILDING],
            },
          }, {
            author: user.id,
          },
        ];
      }
      if (r.type === MEMBER) {
        query.$or = [
          {
            privacy: {
              $in: [PUBLIC],
            },
          }, {
            author: user.id,
          },
        ];
      }
      const ps = await PostsService.find({
        $cursor: cursor,
        query,
      });
      return {
        pageInfo: ps.paging,
        edges: ps.data.map((res) => {
          res.likes.indexOf(user.id) !== -1 ? res.isLiked = true : res.isLiked = false;
          return res;
        }),
      };
    },
    isAdmin(building, _, { user }) {
      if (!user) return false;
      return new Promise(async (resolve) => {
        if (await BuildingMembersModel.findOne({
          building: building._id,
          user: user.id,
          type: ADMIN,
          status: ACCEPTED,
        })) return resolve(true);
        return resolve(false);
      });
    },
    async requests(data, { cursor = null, limit = 10 }) {
      const r = await BuildingMembersService.find({
        $cursor: cursor,
        query: {
          building: data._id,
          type: MEMBER,
          status: PENDING,
          $sort: {
            createdAt: -1,
          },
          $limit: limit,
        },
      });

      if (!r) {
        return {
          pageInfo: {

          },
          edges: [],
        };
      }
      return {
        pageInfo: r.paging,
        edges: r.data,
      };
    },
    async announcements(data, { skip, limit = 5 }, { user }) {
      const isAdmin = await BuildingMembersModel.findOne({
        building: data._id,
        user: user.id,
        type: ADMIN,
      });

      if (!isAdmin) {
        throw new Error('you don\'t have permission to access announcements of building .');
      }
      const r = await AnnouncementsServiceWithSkip.find({
        query: {
          building: data._id,
          isDeleted: { $exists: false },
          $sort: {
            createdAt: -1,
          },
          $skip: skip,
          $limit: limit,
        },
      });

      if (!r) {
        return {
          pageInfo: {

          },
          edges: [],
        };
      }
      return {
        pageInfo: r.paging,
        edges: r.data,
      };
    },
    createdAt(data) {
      return new Date(data.createdAt);
    },
    updatedAt(data) {
      return new Date(data.updatedAt);
    },
  },
  Apartment: {
    building(data) {
      return AddressServices.getBuilding(data.building);
    },
    async announcements(data, { cursor = null, limit = 5 }) {
      const r = await AnnouncementsServiceWithCursor.find({
        $cursor: cursor,
        query: {
          $or: [
            { privacy: { $in: [PUBLIC] } },
            {
              apartments: { _id: data._id },
              privacy: { $in: [PRIVATE] },
            },
          ],
          $sort: {
            createdAt: -1,
          },
          $limit: limit,
        },
      });

      if (!r) {
        return {
          pageInfo: {},
          edges: [],
        };
      }
      return {
        pageInfo: r.paging,
        edges: r.data,
      };
    },
    users(data) {
      return UsersModel.find({ _id: { $in: data.users } });
    },
    owner(data) {
      return UsersModel.findOne({ _id: data.owner });
    },
    createdAt(data) {
      return new Date(data.createdAt);
    },
    updatedAt(data) {
      return new Date(data.updatedAt);
    },
  },
  Event: {
    author(data) {
      return UsersModel.findOne({ _id: data.author });
    },
    building(data) {
      return AddressServices.getBuilding(data.building);
    },
    start(data) {
      return new Date(data.start);
    },
    end(data) {
      return new Date(data.end);
    },
    invites(data) {
      return UsersModel.find({ _id: { $in: data.invites } });
    },
    interests(data) {
      return UsersModel.find({ _id: { $in: data.interests } });
    },
    joins(data) {
      return UsersModel.find({ _id: { $in: data.joins } });
    },
    can_joins(data) {
      return UsersModel.find({ _id: { $in: data.can_joins } });
    },
    cant_joins(data) {
      return UsersModel.find({ _id: { $in: data.cant_joins } });
    },
    createdAt(data) {
      return new Date(data.createdAt);
    },
    updatedAt(data) {
      return new Date(data.updatedAt);
    },
    isAuthor(data, _, { user }) {
      return String(data.author) === String(user.id);
    },
    isInterest(data, _, { user }) {
      return data.interests.indexOf(user.id) > -1;
    },
  },
  Notification: {
    user(notify) {
      return UsersModel.findOne({ _id: notify.user });
    },
    subject(notify) {
      return PostsModel.findById(notify.subject);
    },
    actors(notify) {
      return UsersModel.find({ _id: { $in: notify.actors } });
    },
  },
  Me: {
    async isAdmin(user) {
      const hasRoleAdmin = await BuildingMembersModel.findOne({
        user: user._id,
        type: ADMIN,
        status: ACCEPTED,
      });

      if (!isEmpty(hasRoleAdmin)) {
        return true;
      }

      return false;
    },
    fullName(data) {
      const { profile } = data;
      return `${(profile && profile.firstName) || 'no'} ${(profile && profile.lastName) || 'name'}`;
    },
    posts(data) {
      return new Promise((resolve, reject) => {
        const edgesArray = [];
        const edges = PostsModel.find({
          user: data._id,
          isDeleted: { $exists: false },
        }).sort({ createdAt: -1 }).cursor();

        edges.on('data', (res) => {
          res.likes.indexOf(data._id) !== -1 ? res.isLiked = true : res.isLiked = false;
          edgesArray.push(res);
        });

        edges.on('error', (err) => {
          reject(err);
        });
        edges.on('end', () => {
          resolve(edgesArray);
        });
      });
    },
    building(data) {
      return AddressServices.getBuilding(data.building);
    },
    buildings(data) {
      return AddressServices.getBuildings(data._id);
    },
    apartments(data) {
      return ApartmentsModel.find({
        $or: [
          { owner: data._id },
          { users:
            { $in: [data._id] },
          },
        ],
      });
    },
    async friends(user) {
      let friendListByIds = await FriendsRelationModel.find({
        user: user._id,
        status: ACCEPTED,
      }).select('friend _id');
      friendListByIds = friendListByIds.map(v => v.friend);
      return UsersModel.find({
        _id: { $in: friendListByIds },
      });
    },
    async friendRequests(user) {
      let friendListByIds = await FriendsRelationModel.find({
        friend: user._id,
        status: PENDING,
      }).select('user _id');
      friendListByIds = friendListByIds.map(v => v.user);
      return UsersModel.find({
        _id: { $in: friendListByIds },
      });
    },
    async friendSuggestions(user) {
      const currentFriends = await FriendsRelationModel
        .find({
          $or: [
            { user: user._id },
            { friend: user._id },
          ],
          status: {
            $in: [PENDING, ACCEPTED, BLOCKED],
          },
        })
        .select('user friend _id').lean();

      const ninIds = reduce(currentFriends, (result, item) => {
        result.push(item.user);
        result.push(item.friend);
        return result;
      }, []);
      ninIds.push(user._id);

      const users = await UsersModel.find({
        _id: { $nin: ninIds },
        building: user.building,
        isActive: 1,
      }).limit(5).lean();

      return users;
    },
    totalFriends(user) {
      return FriendsRelationModel.count({ user: user._id });
    },
    totalNotification(user) {
      return NotificationsModel.count({ user: user._id, seen: false });
    },
    createdAt(data) {
      return new Date(data.createdAt);
    },
    updatedAt(data) {
      return new Date(data.updatedAt);
    },
  },
  Post: {
    user(data) {
      return UsersModel.findOne({ _id: data.user });
    },
    author(data) {
      return UsersModel.findOne({ _id: data.author });
    },
    building(data) {
      return AddressServices.getBuilding(data.building);
    },
    sharing(data) {
      return PostsModel.findOne({ _id: data.sharing });
    },
    totalLikes(data) {
      return data.likes.length;
    },
    totalComments(data) {
      return CommentsModel.count({
        post: data._id,
        reply: { $exists: false },
      });
    },
    comments(data, { _id, limit = 2 }) {
      const q = { post: data._id, reply: { $exists: false } };
      if (_id) {
        q._id = { $lt: _id };
      }
      return CommentsModel.find(q).sort({ createdAt: -1 }).limit(limit);
    },
    createdAt(data) {
      return new Date(data.createdAt);
    },
    updatedAt(data) {
      return new Date(data.updatedAt);
    },
    event(data) {
      if (!(data.type === EVENT)) {
        return null;
      }
      return data;
    },
  },
  ExportResidentsInBuildingGroupByApartmentPayload: {
    file(data) {
      const parsed = url.parse(data.file);
      const basename = path.basename(parsed.pathname);
      return data && `${parsed.protocol}//${parsed.host}/download/${basename}?attachment=${kebabCase(data.name || basename)}`;
    },
  },
  Document: {
    author(data) {
      return UsersModel.findOne({ _id: data.author });
    },
    building(data) {
      return AddressServices.getBuilding(data.building);
    },
    createdAt(data) {
      return new Date(data.createdAt);
    },
    updatedAt(data) {
      return new Date(data.updatedAt);
    },
    isDeleted(data) {
      return data && data.isDeleted;
    },
    file(data) {
      const parsed = url.parse(data.file);
      const basename = path.basename(parsed.pathname);
      return data && `${parsed.protocol}//${parsed.host}/download/${basename}?attachment=${kebabCase(data.name || basename)}`;
    },
  },
  FAQ: {
    author(data) {
      return UsersModel.findOne({ _id: data.author });
    },
    building(data) {
      return AddressServices.getBuilding(data.building);
    },
    createdAt(data) {
      return new Date(data.createdAt);
    },
    updatedAt(data) {
      return new Date(data.updatedAt);
    },
    isDeleted(data) {
      return data && data.isDeleted;
    },
  },
  Friend: {
    fullName(data) {
      const { profile } = data;
      return `${(profile && profile.firstName) || 'no'} ${(profile && profile.lastName) || 'name'}`;
    },
    posts(data, _, { user }) {
      return new Promise(async (resolve, reject) => {
        // check if they are friend
        const r = await FriendsRelationModel.findOne({
          friend: user.id,
          user: data._id,
          status: ACCEPTED,
        });
        const select = {
          user: data._id,
          isDeleted: { $exists: false },
        };
        if (r) {
          select.privacy = [PUBLIC, FRIEND];
        } else {
          select.privacy = [PUBLIC];
        }
        const edgesArray = [];
        const edges = PostsModel.find(select).sort({ createdAt: -1 }).cursor();

        edges.on('data', (res) => {
          res.likes.indexOf(user.id) !== -1 ? res.isLiked = true : res.isLiked = false;
          edgesArray.push(res);
        });

        edges.on('error', (err) => {
          reject(err);
        });
        edges.on('end', () => {
          resolve(edgesArray);
        });
      });
    },
    building(data) {
      return AddressServices.getBuilding(data.building);
    },
    apartments(data) {
      return ApartmentsModel.find({ user: data._id });
    },
    friends(data) {
      return FriendsRelationModel.find({ user: data._id, status: ACCEPTED });
    },
    async isFriend(data, _, { user }) {
      return !!await FriendsRelationModel.findOne({
        friend: user.id,
        user: data._id,
        status: ACCEPTED,
      });
    },
    createdAt(data) {
      return new Date(data.createdAt);
    },
    updatedAt(data) {
      return new Date(data.updatedAt);
    },
    async requestInformation(data) {
      const buildingDocument = await BuildingsModel.findOne({
        _id: data.building,
      });

      if (!buildingDocument) {
        return {
          apartments: [],
        };
      }

      const buldingMemberDocument = await BuildingMembersModel.findOne({
        user: data._id,
        status: PENDING,
        building: data.building,
      });
      if (!buldingMemberDocument) {
        return {
          apartments: [],
        };
      }

      const { requestInformation: { apartments } } = buldingMemberDocument;
      const apartmentDocuments = await ApartmentsModel.find({
        _id: {
          $in: apartments,
        },
      });
      if (apartmentDocuments) {
        apartmentDocuments.map((item) => {
          const apartment = clone(item);
          apartment.building = buildingDocument;
          return apartment;
        });
      }
      return {
        apartments: apartmentDocuments,
      };
    },
  },
  Author: {
    posts(data) {
      return PostsModel.find({ user: data._id });
    },
    building(data) {
      return AddressServices.getBuilding(data.building);
    },
    apartments(data) {
      return ApartmentsModel.find({ user: data._id });
    },
    friends() {
      return UsersModel.find({});
    },
    createdAt(data) {
      return new Date(data.createdAt);
    },
    updatedAt(data) {
      return new Date(data.updatedAt);
    },
  },
  Comment: {
    post(data) {
      return PostsModel.findOne({ _id: data.post });
    },
    user(data) {
      return UsersModel.findOne({ _id: data.user });
    },
    totalReply(data) {
      return CommentsModel.count({ reply: data._id });
    },
    createdAt(data) {
      return new Date(data.createdAt);
    },
    updatedAt(data) {
      return new Date(data.updatedAt);
    },
    reply(data) {
      return CommentsModel.find({ post: data.post, reply: data._id });
    },
    parent(comment) {
      return comment.reply;
    },
  },
  User: {
    async posts(data, { cursor = null, limit = 5 }, { user }) {
      const r = await FriendsRelationModel.findOne({
        friend: user.id,
        user: data._id,
        status: ACCEPTED,
      });
      const select = {
        user: data._id,
        isDeleted: { $exists: false },
        $sort: {
          createdAt: -1,
        },
        $limit: limit,
      };
      if (isEqual(data._id, user.id)) {
        select.privacy = [PUBLIC, FRIEND, ONLY_ME];
      }
      if (r) {
        select.privacy = [PUBLIC, FRIEND];
      }
      if (!isEqual(data._id, user.id) && !r) {
        select.privacy = [PUBLIC];
      }
      const p = await PostsService.find({
        $cursor: cursor,
        query: select,
      });
      return {
        pageInfo: p.paging,
        edges: p.data.map((res) => {
          res.likes.indexOf(user.id) !== -1 ? res.isLiked = true : res.isLiked = false;
          return res;
        }),
      };
    },
    async isFriend(data, _, { user }) {
      return !!await FriendsRelationModel.findOne({
        friend: user.id,
        user: data._id,
        status: ACCEPTED,
      });
    },
    @onlyMe()
    async friendSuggestions(data, { cursor = null, limit = 5 }) {
      // get current friends
      const currentFriends = await FriendsRelationModel
        .find({
          $or: [
            { user: data._id },
            { friend: data._id },
          ],
          status: {
            $in: [PENDING, ACCEPTED, BLOCKED],
          },
        })
        .select('user friend _id');

      const ninIds = reduce(currentFriends, (result, item) => {
        const userID = item.user.toString();
        const friendID = item.friend.toString();
        if (result.indexOf(userID) === -1) {
          result.push(userID);
        }
        if (result.indexOf(friendID) === -1) {
          result.push(friendID);
        }
        return result;
      }, [data._id]);

      const r = await UsersService.find({
        $cursor: cursor,
        query: {
          _id: { $nin: ninIds.map(toObjectId) },
          building: data.building,
          isActive: 1,
          $sort: {
            createdAt: -1,
          },
          $limit: limit,
        },
      });

      return {
        pageInfo: r.paging,
        edges: r.data || [],
      };
    },
    async announcements(data, { announcementId, cursor, skip, limit = 4 }) {
      let apartmentsList = await ApartmentsModel.find({ users: data._id }).select('_id');
      apartmentsList = apartmentsList.map(i => i._id);
      let r = null;
      const selectOfBom = {
        $cursor: cursor,
        query: {
          building: data.building,
          isDeleted: { $exists: false },
          $and: [
            { _id: { $nin: [announcementId] } },
          ],
          $sort: {
            createdAt: -1,
          },
          $limit: limit,
        },
      };
      const select = {
        query: {
          isDeleted: { $exists: false },
          $or: [
            { privacy: { $in: [PUBLIC] } },
            {
              apartments: { $in: apartmentsList },
              privacy: { $in: [PRIVATE] },
            },
          ],
          $sort: {
            createdAt: -1,
          },
          $limit: limit,
        },
      };

      const isAdmin = await BuildingMembersModel.findOne({
        user: data.id,
        building: data.building,
        status: ACCEPTED,
        type: ADMIN,
      });

      if (isAdmin) {
        r = await AnnouncementsServiceWithCursor.find(selectOfBom);
      } else if (skip !== undefined) {
        select.query.$skip = skip;
        r = await AnnouncementsServiceWithSkip.find(select);
      } else {
        select.$cursor = cursor;
        if (announcementId) {
          select.query.$and = [
            { _id: { $nin: [announcementId] } },
          ];
          r = await AnnouncementsServiceWithCursor.find(select);
        }
        r = await AnnouncementsServiceWithCursor.find(select);
      }
      if (!r) {
        return {
          pageInfo: {},
          edges: [],
        };
      }
      return {
        pageInfo: r.paging,
        edges: r.data,
      };
    },
    building(data) {
      return AddressServices.getBuilding(data.building);
    },
  },
  // DocumentPayload: {
  //   building(data) {
  //     return AddressServices.getBuilding(data.building);
  //   },
  //   author(data) {
  //     return UsersModel.findOne({ _id: data.author });
  //   },
  // },
  // FAQPayload: {
  //   building(data) {
  //     return AddressServices.getBuilding(data.building);
  //   },
  //   author(data) {
  //     return UsersModel.findOne({ _id: data.author });
  //   },
  // },
  RequestsToJoinBuilding: {
    building(data) {
      return AddressServices.getBuilding(data.building);
    },
    user(data) {
      return UsersModel.findOne({ _id: data.user });
    },
    requestInformation(data) {
      return {
        apartments: ApartmentsModel.find({
          _id: {
            $in: data.requestInformation.apartments,
          },
        }),
      };
    },
  },
  Fee: {
    apartment(data) {
      return ApartmentsModel.findOne({ _id: data.apartment });
    },
    building(data) {
      return AddressServices.getBuilding(data.building);
    },
    createdAt(data) {
      return new Date(data.createdAt);
    },
    updatedAt(data) {
      return new Date(data.updatedAt);
    },
    lastRemind(data) {
      if (data.last_remind) {
        return new Date(data.last_remind);
      }
      return null;
    },
  },
  Announcement: {
    building(data) {
      return AddressServices.getBuilding(data.building);
    },
    async apartments(data) {
      return ApartmentsModel.find({
        _id: {
          $in: data.apartments,
        },
      });
    },
    createdAt(data) {
      return new Date(data.createdAt);
    },
    updatedAt(data) {
      return new Date(data.updatedAt);
    },
  },
};
