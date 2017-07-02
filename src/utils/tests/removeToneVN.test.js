import removeToneVN from '../removeToneVN';

describe('removeToneVN', () => {
  test('test with vietnamese name', async () => {
    // language=GraphQL
    const name = 'Hoàng Nấm';
    expect(removeToneVN(name)).toEqual(1);
  });
});
