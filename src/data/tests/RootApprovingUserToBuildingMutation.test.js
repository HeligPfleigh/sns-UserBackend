import { graphql } from 'graphql';
import {
  setupTest,
  getContext,
} from '../../../test/helper';
import schema from '../schema';
import { UsersModel, BuildingsModel, BuildingMembersModel, ApartmentsModel } from '../models';
import { buildingData as bd, apartmentData as ad } from './data';

// beforeEach(async () => await setupTest());
beforeAll(async () => await setupTest());
jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

const userIdA = '58f9c2502d4581000474b19a';
const userIdB = '58f9c1bf2d4581000474b198';
const buildingId = '58da279f0ff5af8c8be59c36';
const apartmentId = '58f9c1bf2d4581000484b189';
const buildingMembersIdA = '59441e6deae10b5b59ea93c1';
const buildingMembersIdB = '59034c6c60f3c7beab57220a';
const buildingMembersIdC = '59034d8d60f3c7beab57330a';
const buildingMembersIdD = '76859d8d60f3c7beab57120a';
// const announcementId = '23da279f0ff5af8c8be59c36';

const userDataA = {
  _id: userIdA,
  emails: {
    address: 'muakhoc90@gmail.com',
    verified: true,
  },
  username: 'muakhoc90',
  profile: {
    picture: 'https://graph.facebook.com/144057672785233/picture?type=large',
    firstName: 'Duc',
    lastName: 'Linh',
    gender: 'male',
  },
  building: buildingId,
  services: {
    facebook: {
      accessToken: 'EAAJpgxDr0K0BAB2MGE0qk7ErupQ1iRRt6NE4zLeZA4M2852kYgmFVoVexNb3AmsqrkDdFA1TgVk6ekKzRE2nYaGBgjhlPMNEkwtUuvcZAZCIPILdWVBvSPrERxYLHMHJsccSradePPGajydwAonMvW5ciCoknUZD',
      tokenExpire: '2017-06-10T08:26:55.931Z',
    },
  },
  chatId: 'cLq7UcjYopQ5tLGmiR9nnHaKzIR2',
  roles: ['user'],
  __v: 0,
};

const userDataB = {
  _id: userIdB,
  emails: {
    address: 'particle4dev@gmail.com',
    verified: true,
  },
  username: 'particle4dev',
  profile: {
    picture: 'https://graph.facebook.com/596825810516199/picture?type=large',
    firstName: 'Nam',
    lastName: 'Hoang',
    gender: 'male',
  },
  building: buildingId,
  services: {
    facebook: {
      accessToken: 'EAAJpgxDr0K0BAADXzQ67vyDOb3owgMqhvQtze4QQm8dfLkH1Exnt6D3kPbKT6ZB11HyZADOiwkFwvpuHX1ZCVp2fKy63jONwh1UGKQiy7KvK6yzUSpfiIIz63RN4ZB8GNa8qIpxbnoXhV9CVgsMSqgMoRoi5Bi4ZD',
      tokenExpire: '2017-06-10T08:24:30.744Z',
    },
  },
  chatId: '4p4vIMzYwUhiFiqbBMggcbAItX03',
  roles: [
    'user',
  ],
  __v: 0,
};

const buildingData = Object.assign({}, bd, {
  _id: buildingId,
});

const apartmentData = Object.assign({}, ad, {
  _id: apartmentId,
  building: buildingId,
});

const buildingMembersDataA = {
  _id: buildingMembersIdA,
  building: buildingId,
  user: userIdA,
  status: 'ACCEPTED',
  type: 'ADMIN',
  requestInformation: {
    apartments: [apartmentId],
    detail: {},
  },
  __v: 0,
};

const buildingMembersDataB = {
  _id: buildingMembersIdB,
  building: buildingId,
  user: userIdB,
  status: 'PENDING',
  type: 'MEMBER',
  requestInformation: {
    apartments: [apartmentId],
    detail: {},
  },
  __v: 0,
};

const buildingMembersDataD = {
  _id: buildingMembersIdD,
  building: buildingId,
  user: userIdB,
  status: 'ACCEPTED',
  type: 'MEMBER',
  requestInformation: {
    apartments: [apartmentId],
    detail: {},
  },
  __v: 0,
};

describe('RootApprovingUserToBuildingMutation', () => {
  beforeEach(async () => {
    // setup db
    const user = new UsersModel(userDataA);
    await user.save();
    const userB = new UsersModel(userDataB);
    await userB.save();
    const building = new BuildingsModel(buildingData);
    await building.save();
    const buildingMembersA = new BuildingMembersModel(buildingMembersDataA);
    await buildingMembersA.save();
    const buildingMembersB = new BuildingMembersModel(buildingMembersDataB);
    await buildingMembersB.save();
    const buildingMembersD = new BuildingMembersModel(buildingMembersDataD);
    await buildingMembersD.save();
    const apartment = new ApartmentsModel(apartmentData);
    await apartment.save();
  });

  test('should approve user to building ', async () => {
    const input = {
      input: '{' +
        'requestsToJoinBuildingId: "' + buildingMembersIdB + '",' +
      '},',
    };
    // language=GraphQL
    const query = `
      mutation M {
        approvingUserToBuilding(input: ${input.input}) {
          request {
            _id
            type
            status
          }
        }
      }
    `;

    const rootValue = {
      request: {
        user: {
          id: userIdA,
        },
      },
    };
    const context = getContext({});
    const result = await graphql(schema, query, rootValue, context);
    expect(result.data.approvingUserToBuilding).toEqual(Object.assign({}, {
      request: {
        _id: buildingMembersIdB,
        type: 'MEMBER',
        status: 'ACCEPTED',
      },
    }));
  });

  test('should throw error if not found the request ', async () => {
    const input = {
      input: '{' +
        'requestsToJoinBuildingId: "' + buildingMembersIdC + '",' +
      '},',
    };
    // language=GraphQL
    const query = `
      mutation M {
        approvingUserToBuilding(input: ${input.input}) {
          request {
            _id
            type
            status
          }
        }
      }
    `;

    const rootValue = {
      request: {
        user: {
          id: userIdA,
        },
      },
    };
    const context = getContext({});
    const result = await graphql(schema, query, rootValue, context);
    expect(result.errors[0].message).toEqual('not found the request');
  });

  test('should throw error if you don\'t have permission to reject request', async () => {
    const input = {
      input: '{' +
        'requestsToJoinBuildingId: "' + buildingMembersIdB + '",' +
      '},',
    };
    // language=GraphQL
    const query = `
      mutation M {
        approvingUserToBuilding(input: ${input.input}) {
          request {
            _id
            type
            status
          }
        }
      }
    `;

    const rootValue = {
      request: {
        user: {
          id: userIdB,
        },
      },
    };
    const context = getContext({});
    const result = await graphql(schema, query, rootValue, context);
    expect(result.errors[0].message).toEqual('you don\'t have permission to approve request');
  });

  test('should return record if user approved ', async () => {
    const input = {
      input: '{' +
        'requestsToJoinBuildingId: "' + buildingMembersIdD + '",' +
      '},',
    };
    // language=GraphQL
    const query = `
      mutation M {
        approvingUserToBuilding(input: ${input.input}) {
          request {
            _id
            type
            status
          }
        }
      }
    `;

    const rootValue = {
      request: {
        user: {
          id: userIdA,
        },
      },
    };
    const context = getContext({});
    const result = await graphql(schema, query, rootValue, context);
    expect(result.data.approvingUserToBuilding).toEqual(Object.assign({}, {
      request: {
        _id: buildingMembersIdD,
        type: 'MEMBER',
        status: 'ACCEPTED',
      },
    }));
    // await new Promise((resolve) => {
    //   setTimeout(resolve, 5000);
    // });
  });

  afterEach(async () => {
    // clear data
    await UsersModel.remove({});
    await BuildingsModel.remove({});
    await BuildingMembersModel.remove({});
    await ApartmentsModel.remove({});
  });
});
