import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLID,
  GraphQLNonNull,
} from 'graphql';
import _ from 'lodash';

import UserInterface from './UserInterface';
import PostSchemas from './PostSchemas';
import ProfileSchemas from './ProfileSchemas';
import BuildingSchemas from './BuildingSchemas';
import ApartmentsSchemas from './ApartmentsSchemas';
import { PENDING, ACCEPTED } from '../../constants';

import {
  PostsModel,
  UsersModel,
  FriendsRelationModel as FriendsModel,
  BuildingsModel,
  ApartmentsModel,
} from '../models';

const UserSchemas = new GraphQLObjectType({
  name: 'UserSchemas',
  interfaces: [UserInterface],
  description: 'UserInterface',
  fields: () => ({
    _id: {
      type: new GraphQLNonNull(GraphQLID),
      // resolve: (user) => user._id,
    },
    username: {
      type: GraphQLString,
      // resolve: (user) => user._id,
    },
    profile: {
      type: ProfileSchemas,
    },
    posts: {
      type: new GraphQLList(PostSchemas),
      resolve: user => PostsModel.find({ owner: user._id }),
    },
    building: {
      type: new GraphQLList(BuildingSchemas),
      resolve: user => BuildingsModel.find({ _id: user.building }),
    },
    apartments: {
      type: new GraphQLList(ApartmentsSchemas),
      resolve: user => ApartmentsModel.find({ user: user._id }),
    },
    friends: {
      type: new GraphQLList(UserSchemas),
      resolve: async (user) => {
        let friendListByIds = await FriendsModel.find({
          user: user._id,
          status: ACCEPTED,
        }).select('friend _id');
        friendListByIds = friendListByIds.map(v => v.friend);
        return UsersModel.find({
          _id: { $in: friendListByIds },
        });
      },
    },
    friendRequests: {
      type: new GraphQLList(UserSchemas),
      resolve: async (user) => {
        let friendListByIds = await FriendsModel.find({
          friend: user._id,
          status: PENDING,
        }).select('user _id');
        friendListByIds = friendListByIds.map(v => v.user);
        return UsersModel.find({
          _id: { $in: friendListByIds },
        });
      },
    },
    friendSuggestions: {
      type: new GraphQLList(UserSchemas),
      resolve: async (user) => {
        const currentFriends = await FriendsModel.find().or([{ user: user._id }, { friend: user._id }]).select('user friend _id');
        const ninIds = _.reduce(currentFriends, (result, item) => {
          result.push(item.user);
          result.push(item.friend);
          return result;
        }, []);
        let usersId = await ApartmentsModel.find({
          user: { $nin: ninIds },
          building: user.building,
        }).select('user _id').limit(5);
        usersId = usersId.map(v => v.user);
        return UsersModel.find({
          _id: { $in: usersId },
        });
      },
    },
    totalFriends: {
      type: GraphQLInt,
      resolve: async user => FriendsModel.count({ user: user._id }).select('_id'),
    },
  }),
});

export default UserSchemas;
