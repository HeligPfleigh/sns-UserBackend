import * as firebase from 'firebase';
import EventEmitter from 'events';
import uuidV4 from 'uuid/v4';

export class FirebaseProvider {

  constructor(config) {
    const defaultApp = firebase.initializeApp(config);
    this.service = defaultApp;
  }
  async getStaticData(ref) {
    const refData = this.service.database().ref(ref);
    const promise = new Promise((resolve, reject) => {
      refData.once('value').then((snapshot) => {
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
  onMessage(conversationId, cb) {
    if (this.user) {
      const messengerRef = this.service.database().ref(`messages/${conversationId}`);
      messengerRef.on('value', (snapshot) => {
        cb(null, snapshot.val());
      });
    }
  }
  sendMessage(data) {
    if (this.user) {
      const updates = {};
      if (data.isNew) {
        data.conversationId = this.service.database().ref().child('conversation').push().key;
        updates[`/conversation/${data.conversationId}`] = {
          lastMessage: data.message,
          timestamp: firebase.database.ServerValue.TIMESTAMP,
        };
      }
      updates[`/conversation/${data.conversationId}`] = {
        lastMessage: data.message,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        owner: this.user,
      };
      const messageId = this.service.database().ref().child('messages').push().key;
      updates[`/messages/${data.conversationId}/${messageId}`] = {
        message: data.message,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        owner: this.user,
      };

      this.service.database().ref().update(updates);
      return data.conversationId;
    }
    return null;
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
