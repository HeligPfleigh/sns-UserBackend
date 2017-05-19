import { graphql } from 'graphql';
import {
  setupTest,
} from '../../../test/helper';
import schema from '../schema';
import { PostsModel, UsersModel } from '../models';

beforeEach(async () => await setupTest());

describe('sub', () => {
  test('adds 2 - 1 to equal 1', async () => {

    // setup db
    const userData = {
      _id: "58f9c2502d4581000484b18a",
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

    const user = new UsersModel(userData);
    await user.save();

    const postData = {
      _id: "58f9d6b62d4581000484b1a3",
      createdAt: "2017-04-21T09:53:58.111Z",
      updatedAt: "2017-04-28T09:22:56.911Z",
      message:"{\"entityMap\":{},\"blocks\":[{\"key\":\"4gvpl\",\"text\":\"Viet nam tuoi dep\",\"type\":\"unstyled\",\"depth\":0,\"inlineStyleRanges\":[],\"entityRanges\":[],\"data\":{}}]}",
      user: "58f9c2502d4581000484b18a",
      likes: ["58f9d2132d4581000484b1a0"],
      photos: [],
      type: "STATUS",
      __v: 0
    };
    const post = new PostsModel(postData);
    await post.save();

    //language=GraphQL
    const query = `
      {
        post (_id:"58f9d6b62d4581000484b1a3") {
          _id
          user {
            _id
          }
        }
      }
    `;

    const rootValue = {};
    // const context = getContext({ user });
    const context = {};
    const result = await graphql(schema, query, rootValue, context);
    expect(result.data.post._id.toString()).toBe(postData._id);
    expect(result.data.post.user._id.toString()).toBe(userData._id);

  });
});
