import * as firebase from 'firebase';
import EventEmitter from 'events';

export class FirebaseProvider {

  constructor(config) {
    const defaultApp = firebase.initializeApp(config);
    this.service = defaultApp;
  }
  async auth(token) {
    try {
      await this.service.auth().signInWithCustomToken(token);
      const user = await this.service.auth().currentUser;
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
        data.conversationId = this.service.database().ref().child('messages').push().key;
        updates[`/conversation/${data.conversationId}`] = {
          lastMessage: data.message,
          timestamp: firebase.ServerValue.TIMESTAMP,
        };
        updates[`/members/${data.conversationId}`] = {
          [this.user.uid]: true,
          [data.to.uid]: true,
        };
      }
      updates[`/conversation/${data.conversationId}`] = {
        message: data.message,
        timestamp: firebase.ServerValue.TIMESTAMP,
        from: data.from,
        to: data.to,
      };
      return this.service.database().ref().update(updates);
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
