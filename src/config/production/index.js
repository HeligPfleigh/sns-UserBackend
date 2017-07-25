export const port = process.env.API_PORT || 8081;
export const host = `localhost:${port}`;
export const client = 'sns.mttjsc.com';

export const databaseUrl = process.env.DATABASE_URL || 'mongodb://mongo:27017/sns';

export const mailer = {
  smtp: {
    service: 'Gmail',
    auth: {
      user: 'sns.mail.center@gmail.com',
      pass: 'Mtt2016a@',
    },
  },
  from: '"SNS SERVICE" <sns.mail.center@gmail.com>',
};

export const auth = {
  facebook: {
    id: process.env.FACEBOK_ID || '669818893191009',
    secret: process.env.FACEBOK_SECRET || 'a06b0239c7df66ab9f13e878b0d77029',
    callBackURL: process.env.FACEBOK_CALLBACK_URL || 'http://sns.mttjsc.com/auth/facebook/return',
  },
  firebase: {
    apiKey: process.env.FIREBASE_PROJECT_APIKEY || 'AIzaSyDgbPU5DuXmvxWprMwc-HxTMae05c6rCPc',
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'snschat-fb64b.firebaseapp.com',
    databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://snschat-fb64b.firebaseio.com',
    projectId: process.env.FIREBASE_PROJECT_ID || 'snschat-fb64b',
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'snschat-fb64b.appspot.com',
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '1034925992768',
  },
  firebaseAdmin: {
    type: 'service_account',
    project_id: 'snschat-fb64b',
    private_key_id: 'fff4e9878722503cb5e8bcfd7536ea3cda4a7e16',
    private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDfmkRHV0XNHp7A\nY9y7MrAwlf/7d0CfBzym1oQJUpDD1GfDvdJ45PYmgpUHgR7tfkTYnvHTajTpdIsL\nu9Tvl0nscGoXbDN+dFoDEHvC4l18gwAWa0iLAyYwAfUIF5iCcLCyxzjtUVujjdkK\nyih5rmEs6i3mB/fzuuL21f+ej2CTnCF0QZCqdZaBhybqNF7IkAXiWx8kzI2AMCwv\nMhMrHwMZW5S9uVxCGyh+nWUPAtZaiGV3US0GpQYAdaR1tC/e17ma4HY6Z+Jfscgt\nMhhjU8hUz0Lxn5vI+NntwLSpvfM3C10T1pI1kzVA9GbeVpoSY6oSroph8vvSAkdH\nytRuNEqTAgMBAAECggEBAMKvCYXn+bFXWLd/+z7OKlOTNpbWxN/xqCBHJB0N01d+\nB36JNsjl6V+sUF+BT9FOIFlPQpRlo34kZ7AmsYaN/eIsGmMcZVVTrs9+OZN8DhOL\n57adYEMQ0d34xkRubu4bee2ewfT24kfsCC55x3Xym09E8gOXqo5+iICL4I1InrjF\nFeNISeJRMDy8t3KAjGeFLmZY7hJ6/vXQeug4p7/+y9TkcfFacCp2BDUboWNRE15c\nx1BDYydCZoOXMH8iqMN0XaLPVhWFmvR6rnxAZpJgZ6r6c+bb15ojNW+i3JhCXMHb\nerG5kYtDwgyzpOBKCjCPZxLKg3cJvFdlZrxTAQsNdckCgYEA+dPQ7Qmomx+pS3jc\n/hyRPx4xQdK2bIqembJp1hpp7xuNE87lxBGeOddmzV0TbrMqA1Owzi+DOlLn1ICf\nYMZqJD8oTr71yq02ATlRkW1MNc5zmSeA6WdLxPsbWbzy/QgA02CarWoHwvm7mgZn\nCw0ZTzvHc/Ipu007+It7uDtsvn8CgYEA5SCTd3BHmRbpf6dpaLPGy49Uc8oA+3Qd\nhMF9Qcunf5qw9ztfS4V0pI8s+vwCLEvgVrGwxDjDXcdKGARSK5dxVWviUpfJrvTq\naHpPEa2JulcUXZBRZDANdg6nQaJqwlZuUWrABI4liARygIMA7Glzpklt92fzskfH\nQOxQoSBeke0CgYEA1Mo64Tth1kcAft1CdlrEyFsiH2unoAnuDwGtLgUvh88SufV3\nNSrAd4nl8TO/EoIeXdkR9nz3rFzjQ9gOaHJ4A8mbvn7egjRIlIBK3rCWwhnH0oKY\nRbWLDwvG/wd2fFktwt08wkpWtBbcWNPtPrd4gEltmG+CZhvh4dCEn6ZV+GcCgYBG\nXfXMBZiHhIjbYm+17xhLZc5a7RvWHbf/EGlGbqQXRUu58er3R5ol+66lugV00yyn\nk1SlPoWJZG316EXQC2eMA2DzWphe+eqPgZiM5k3ZA2tGvM6yRSutKRzmxFmjK2Yf\n7PfhrkIKfssnepQrBsu0svJpu+wUwYSJBMpSYZ2JlQKBgQD2kU04Hi+R1nUW7NsU\nyxrzPYYhI9XvFxKZJ0JUiSdO/yQB2E+b8EpSm6A/v2wuKCS2BvuoXYBkYgvwi/0c\nCxXROveqFKru8jUkLZ1g/qjOw2JOsZncCJAbYoLl6uZ1+TqrQhIQwmEVHe0Ltw9t\nASrg7sLU04Ck1CXYtx/WkpZOKQ==\n-----END PRIVATE KEY-----\n',
    client_email: 'firebase-adminsdk-1gt28@snschat-fb64b.iam.gserviceaccount.com',
    client_id: '100137623575146372755',
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://accounts.google.com/o/oauth2/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-1gt28%40snschat-fb64b.iam.gserviceaccount.com',
  },
  jwt: { secret: process.env.JWT_SECRET || 'React Starter Kit' },
};
