const schema = `
type Building {
  _id: ID!
  name: String
}

type Apartment {
  _id: ID!
  number: Int
  building: Building
}

type Post {
  _id: ID!
  message: String
  user: User
}

type Profile {
  picture: String
  firstName: String
  lastName: String
  gender: String
}

type User {
  _id: ID!
  username: String
  profile: Profile
  chatId: String
  posts: [Post]
  building: [Building]
  apartments: [Apartment]
  friends: [User]
  friendRequests: [User]
  friendSuggestions: [User]  
  totalFriends: Int
  totalNotification: Int
}

# the schema allows the following query:
type Query {
  user(_id: String!): User
  users: [User]
  building(_id: String!): Building
}
`;

export default schema;
