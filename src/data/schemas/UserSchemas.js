import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLID,
  GraphQLNonNull,
  GraphQLBoolean,
} from 'graphql';

import UserInterface from './UserInterface';
import PostSchemas from './PostSchemas';
import ProfileSchemas from './ProfileSchemas';
import BuildingSchemas from './BuildingSchemas';
import ApartmentsSchemas from './ApartmentsSchemas';

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
        let friendListByIds = await FriendsModel.find({ user: user._id }).select('friend _id');
        friendListByIds = friendListByIds.map(v => v.friend);
        return UsersModel.find({
          _id: { $in: friendListByIds },
        });
      },
    },
    friendSuggestions: {
      type: new GraphQLList(UserSchemas),
      resolve: async (user) => {
        let friendListByIds = await FriendsModel.find({ user: user._id }).select('friend _id');
        friendListByIds = friendListByIds.map(v => v.friend);
        friendListByIds.push(user._id);
        let usersId = await ApartmentsModel.find({
          user: { $nin: friendListByIds },
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
