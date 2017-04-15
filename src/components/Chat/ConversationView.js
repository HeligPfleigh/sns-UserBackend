import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { connect } from 'react-redux';
import _ from 'lodash';
import s from './Conversation.scss';
import ChatEditor from './ChatEditor';
import Message from './Message';
import NewMessage from './NewMessage';
import { addNewUserToConversation, sendMessage } from '../../actions/chat';

@connect(
  state => ({
    chatState: state.chat,
  }),
  { addNewUserToConversation, sendMessage },
)
class ConversationView extends React.Component {
  static propTypes = {
    chatState: PropTypes.object,
    addNewUserToConversation: PropTypes.func.isRequired,
    sendMessage: PropTypes.func.isRequired,
  };
  handleSend = (message) => {
    const { chatState } = this.props;
    const { newChat, current } = chatState;
    if (newChat.active && newChat.receiver) {
      this.props.sendMessage({ to: newChat.receiver, message });
    } else if (current) {
      this.props.sendMessage({ message, conversationId: current });
    }
  }
  render() {
    const { chatState: { user, current, conversations, messages } } = this.props;
    const activeConversation = _.find(conversations, o => _.has(o, current));
    const receiver = activeConversation && Object.values(activeConversation)[0] && Object.values(activeConversation)[0].receiver;
    const members = [user, receiver];
    const messagesOnChat = messages && messages[current];
    return (
      <div className={s.viewChat}>
        <div>
          <NewMessage />
        </div>
        <div className={s.messagesList}>
          {
            messagesOnChat && messagesOnChat.map(message => <Message key={Object.keys(message)[0]} members={members} message={message} />)
          }
        </div>
        <div className={s.editor}>
          <ChatEditor handleAction={this.handleSend} />
        </div>
      </div>
    );
  }
}

export default withStyles(s)(ConversationView);
