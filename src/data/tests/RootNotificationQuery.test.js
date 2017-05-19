import { graphql } from 'graphql';
import {
  setupTest,
} from '../../../test/helper';
import schema from '../schema';
import { UsersModel, NotificationsModel } from '../models';

// beforeEach(async () => await setupTest());
beforeAll(async () => await setupTest());
jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000; 

const userId = "58f9c2502d4581000484b20a";
const notificationId = "591022a0bb2a180011212ce4";
const userData = {
  _id: userId,
  createdAt: "2017-04-21T08:26:56.403Z",
  updatedAt: "2017-04-21T08:26:56.403Z",
  emails: {
    address: "muakhoc90@gmail.com",
    verified:true
  },
  username: "muakhoc90",
  profile: {
    picture:"https://graph.facebook.com/144057672785233/picture?type=large",
    firstName:"Duc",
    lastName:"Linh",
    gender:"male"
  },
  building: "58da279f0ff5af8c8be59c36",
  services:{
    facebook:{
      accessToken: "EAAJpgxDr0K0BAB2MGE0qk7ErupQ1iRRt6NE4zLeZA4M2852kYgmFVoVexNb3AmsqrkDdFA1TgVk6ekKzRE2nYaGBgjhlPMNEkwtUuvcZAZCIPILdWVBvSPrERxYLHMHJsccSradePPGajydwAonMvW5ciCoknUZD",
      tokenExpire: "2017-06-10T08:26:55.931Z"
    }
  },
  chatId: "cLq7UcjYopQ5tLGmiR9nnHaKzIR2",
  roles: ["user"],
  __v: 0
};
const notificationData = {
  _id: notificationId,
  createdAt : "2017-05-08T07:47:44.815Z",
  updatedAt : "2017-05-08T07:47:44.815Z",
  user: userId,
  subject: "5909b0239bdbcd0011863f34",
  actors: [ 
    userId
  ],
  seen: false,
  type: "LIKES",
  __v: 0
};

describe('RootNotificationQuery', () => {
  beforeEach(async () => {
    // setup db
    const user = new UsersModel(userData);
    await user.save();
    const notification = new NotificationsModel(notificationData);
    await notification.save();
  });

  test('should get notification by id', async () => {
    //language=GraphQL
    const query = `
      {
        notification (_id:"${notificationId}") {
          _id
        }
      }
    `;

    const rootValue = {};
    // const context = getContext({ user });
    const context = {};
    const result = await graphql(schema, query, rootValue, context);
    expect(result.data.notification).toEqual(Object.assign({}, {
      _id: notificationData._id,
    }));

  });

  afterEach(async () => {
    // clear data
    await UsersModel.remove({
      _id: userData._id
    });
    await NotificationsModel.remove({
      _id: notificationData._id
    });
  });
});
