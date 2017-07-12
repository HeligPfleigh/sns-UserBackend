export const port = 3005;
export const host = `localhost:${port}`;

export const databaseUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017/sns_test';

export const auth = {
  facebook: {
    id: '678961598943405',
    secret: '06a4ac09ae386fa9779547a6de5c0dd3',
    callBackURL: '/auth/facebook/return',
  },
  firebase: {
    apiKey: 'AIzaSyC-AodKtlF-jqrHwVZ5SfxAYlWBHEbC6Xc',
    authDomain: 'sns-chat-dev.firebaseapp.com',
    databaseURL: 'https://sns-chat-dev.firebaseio.com',
    projectId: 'sns-chat-dev',
    storageBucket: 'sns-chat-dev.appspot.com',
    messagingSenderId: '755931811387',
  },
  firebaseAdmin: {
    type: 'service_account',
    project_id: 'sns-chat-dev',
    private_key_id: 'de883bbdad9897b8db4bc25d2bb2c33cda963fc5',
    private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDBj6OBjfPF0qxy\nDl4CgLO8dzxB9hPcY2+WB8ckC0lT7r5eR9i3HYwWy97Ro0qRxfi20COzmxCgeKFd\nivGZk5p8egoDOMKrTMq/SfSzSqp8fValunQn0R4bAW0eLauKiRoyliV/ebqKoKrX\nRKWx+TP0bjMRjrASvSZeKIniSUARO/qFsjYCZUX1FxrwNUDl4pQ0NDtBsJZq8XuC\n8fk+XJpbhSmbBeTfbOSGds6Mq55TvdVd89/IidIPpU0BkA9PupcJIO1d2KnlIzgs\nI/1u6e4LTniMGL5XQv9tjLOFrT0gcXNu4hz+afbWuN8wmBSoQ8nEesYewQBX/DhP\nwCkFrADBAgMBAAECggEACFQp8PUuvCBoky/TE8B9+2oWCbCRAja1InuLMh3aNeZc\nAqqMxLRcxs5W9CZWmxctsJAcOSo++Oi36NKFutoDF8AYljLnDX/saXbBNMXNuDWc\neN0hCmWRKhBRpa7JZtina+3SBz4xrK1lLIYjqxjSB36GbAb7xJKnB/4ukLIeM5+R\n4kmCVsbwRAQ54m7GdRLiyoxxkwx5IlH296yVuIhas0Jf6FYRFmWnAK1ZWirL85Pk\nAL7Qt2/3pT6T3JUqspUpcaj+ID61EPXOTeQopNTsqfCKZTil9IFBqHgKsFn4aMAO\nbb21r5Y5kDSjOI6u5H9Buhz4N/8ADyahBW2QE60GEQKBgQDs+YEK/U7axzdGNhBE\n0Iy8DXvB+HRH99UgrN8DoqtQKjdJ1d2BgeYjp8ypA/qmu06R5vb00dca/AoP5KgT\nj5doVnLs4JfXpeLLqasYPPerqLIaphTvgoEXp3euYJ2jloXO1qCNtLxD66d1pEeJ\n9V0ck9zNJOdJ3R57/8Xmd/z7bwKBgQDRGd06+KAg1Zdlu+ZyeW9GaODE3HoFNXZK\ntcwGNdSVB8+VcozX4or72NKhw93NQga5DuEwHX1rcAAV+N0ntfuZj/ZIRlirD2wQ\nqusMUnwb/16bGx4HApULkOmFp1yDJDRXczSKFh+dRgLwhT4SlJEkK0nhSRTlfYbv\nJOUP951uzwKBgDEcbD/oy0TP8IaegbShO+llKfbDFOYtWIATE4zfU32joh2tMuC6\nGQXeqq2EY5fWTawzH48RRfETtsogayzSn2BCOkMZMJ7ChEQM/6ZgTDvJFFAthz0z\n4KkUTdtXrpPOiCCbnl5/zFyPI/9fcmwG66sWgbYKJdzK9JxiH5Np3oYFAoGBAIV6\nWDGrwjQThJiJkLqkb/bnPgwMncuza/aXBE02kaQsn0NMI0IwN/46U4K10GGVc0sw\nh2k6efRaQ4PDIBGYZqqJLnLGjRVtO9OL940fHmCU7GRgtBNPf6spbxhFVJXWR59H\nSFOZecbgiUHWHGCp+9i11Wx9RVyVe8wuphZCP3obAoGBAJUqXr9VABlsavWVx+Bd\nnK7KakMXMZqhET2v7wGdo5zQXGvp3Na1gof9Bho4UzrvDGb/hG6XkayWCoAvqR8k\nwtBEE5Xb6KTSc+vsMUk9D7EZ7dvAk19pV+vFPHYqSB/hjxVTuD2m9YrHcRy6ar0A\nU75Ex9VrK5m3lKGh6psXa3lL\n-----END PRIVATE KEY-----\n',
    client_email: 'firebase-adminsdk-1gysd@sns-chat-dev.iam.gserviceaccount.com',
    client_id: '118444229404027110527',
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://accounts.google.com/o/oauth2/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-1gysd%40sns-chat-dev.iam.gserviceaccount.com',
  },
  jwt: { secret: process.env.JWT_SECRET || 'React Starter Kit' },
};
