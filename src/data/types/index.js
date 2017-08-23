// import { property } from 'lodash';
import reduce from 'lodash/reduce';
import clone from 'lodash/clone';
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

type Apartment implements Node {
  _id: ID!
  number: Int
  building: Building
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

type Notification implements Node {
  _id: ID!
  user: Author!
  type: NotificationType!
  seen: Boolean
  isRead: Boolean
  subject: Post
  actors: [Author]

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
  posts: [Post]
  friends: [Friend]
  building: Building
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
type PageInfo {
  endCursor: String
  hasNextPage: Boolean
  total: Int
  limit: Int
}

type Feeds {
  pageInfo: PageInfo
  edges: [Post]
}

type Events {
  pageInfo: PageInfo
  edges: [Event]
}

type NotificationsResult {
  pageInfo: PageInfo
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
  totalFriends: Int
  totalNotification: Int
  isFriend: Boolean
  createdAt: Date
  updatedAt: Date
}
type PostConnection {
  pageInfo: PageInfo
  edges: [Post]
}
type UserConnection {
  pageInfo: PageInfo
  edges: [User]
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

enum BuildingAnnouncementType {
  TYPE1
  TYPE2
}

type BuildingAnnouncement {
  _id: ID!
  type: BuildingAnnouncementType
  date: Date
  message: String
}

type PageSkipInfo {
  skip: Int
  hasNextPage: Boolean
  total: Int
  limit: Int
}

type BuildingPostsConnection {
  pageInfo: PageInfo
  edges: [Post]
}

type BuildingAnnouncementConnection {
  pageInfo: PageSkipInfo
  edges: [BuildingAnnouncement]
}

type UsersAwaitingApprovalConnection {
  pageInfo: PageInfo
  edges: [RequestsToJoinBuilding]
}

type Building implements Node {
  _id: ID!
  name: String
  display: String
  address: Address
  isAdmin: Boolean
  apartments: [Apartment]
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
    apartments(building) {
      return ApartmentsModel.find({ building: building._id });
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
    async announcements(data, { skip = 0, limit = 5 }) {
      const t = await BuildingsModel.aggregate([
        {
          $match: {
            _id: data._id,
          },
        },
        {
          $project: {
            total: {
              $size: {
                $ifNull: ['$announcements', []],
              },
            },
          },
        },
      ]);
      const r = await BuildingsModel.aggregate([
        {
          $match: {
            _id: data._id,
          },
        },
        {
          $project: {
            announcements: 1,
          },
        },
        {
          $unwind: '$announcements',
        },
        {
          $sort: {
            'announcements.date': -1,
          },
        },
        {
          $skip: skip,
        },
        {
          $limit: limit,
        },
      ]);
      const edges = r.map(i => i.announcements);
      return {
        pageInfo: {
          skip,
          hasNextPage: t[0].total > skip,
          total: t[0].total,
          limit,
        },
        edges,
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
    apartments(data) {
      return ApartmentsModel.find({ user: data._id });
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
      if (data._id == user.id) {
        select.privacy = [PUBLIC, FRIEND, ONLY_ME];
      }
      if (r) {
        select.privacy = [PUBLIC, FRIEND];
      }
      if (data._id != user.id && !r) {
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
    building(data) {
      return AddressServices.getBuilding(data.building);
    },
  },
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
};
