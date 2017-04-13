import * as firebase from 'firebase';
import EventEmitter from 'events';

export class FirebaseProvider {

  constructor(config) {
    const defaultApp = firebase.initializeApp(config);
    this.service = defaultApp;
  }
  async getStaticData(ref) {
    if (typeof ref === 'string') {
      ref = this.service.database().ref(ref);
    }
    const promise = new Promise((resolve, reject) => {
      ref.once('value').then((snapshot) => {
        resolve(snapshot.val());
      }).catch((error) => {
        reject(error);
      });
    });
    const data = await promise;
    return data;
  }
  async auth(token) {
    try {
      await this.service.auth().signInWithCustomToken(token);
      let user = await this.service.auth().currentUser;
      user = await this.getStaticData(`users/${user.uid}`);
      this.user = user;
      return user;
    } catch (error) {
      return error;
    }
  }
  async setUser(user) {
    if (this.user) {
      await this.service.database().ref(`users/${this.user.uid}`).set(user);
    }
  }
  async getUser(chatId) {
    if (this.user && chatId) {
      const user = await this.getStaticData(`users/${chatId}`);
      return user;
    }
    return this.user;
  }
  async onMessage(conversationId, cb) {
    if (this.user) {
      const history = await this.getStaticData(`messages/${conversationId}`);
      cb(null, { history });
      const messengerRef = this.service.database().ref(`messages/${conversationId}`);
      messengerRef.on('child_added', (snapshot) => {
        cb(null, { new: snapshot.val() });
      });
    }
  }
  async sendMessage(data) {
    if (this.user) {
      const updates = {};
      if (!data.conversation) {
        data.conversation = await this.service.database().ref().child('conversation').push().key;
        updates[`/members/${data.conversation}`] = {
          [this.user.uid]: true,
          [data.to.uid]: true,
        };
        updates[`/conversation/${data.conversation}`] = {
          meta: {
            lastMessage: data.message,
            timestamp: firebase.database.ServerValue.TIMESTAMP,
          },
          receiver: data.to,
        };
      } else {
        updates[`/conversation/${data.conversation}/meta`] = {
          lastMessage: data.message,
          timestamp: firebase.database.ServerValue.TIMESTAMP,
        };
      }
      const messageId = await this.service.database().ref().child('messages').push().key;
      updates[`/messages/${data.conversation}/${messageId}`] = {
        message: data.message,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        user: this.user.uid,
      };

      await this.service.database().ref().update(updates);
      return data.conversation;
    }
    return null;
  }
  async onConversation(cb) {
    if (this.user) {
      const ref = this.service.database().ref('conversation/');
      ref.on('child_added', (snapshot) => {
        let newData = snapshot.val();
        if (newData) {
          newData = { [snapshot.key]: newData };
          cb(null, newData);
        }
      });
    }
  }
  dataEvent(params) {
    const eventEmitter = new EventEmitter();
    if (this.user) {
      let dataRef;
      if (!params) {
        dataRef = this.service.database().ref();
        dataRef.on('value', (snapshot) => {
          eventEmitter.emit('data', snapshot.val());
        });
      }
      if (params && params.conversations) {
        dataRef = this.service.database().ref('conversation');
        dataRef.on('value', (snapshot) => {
          eventEmitter.emit('data', snapshot.val());
        });
      }
    }
    return eventEmitter;
  }
}
const serviceChatFactory = {
  createClient: (Provider, config) => new Provider(config),
};
export default serviceChatFactory;
