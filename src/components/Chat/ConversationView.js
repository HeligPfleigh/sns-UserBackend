import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { connect } from 'react-redux';
import s from './Conversation.scss';
import ChatEditor from './ChatEditor';
import { addNewUserToConversation, sendMessage } from '../../actions/chat';

@connect(
  state => ({
    newConversation: state.chat.new,
  }),
  { addNewUserToConversation, sendMessage },
)
class ConversationView extends React.Component {
  static propTypes = {
    newConversation: PropTypes.object,
    addNewUserToConversation: PropTypes.func.isRequired,
    sendMessage: PropTypes.func.isRequired,
  };
  componentWillReceiveProps(nextProps) {
    const { newConversation } = this.props;
    if (nextProps.newConversation.active && !newConversation.active) {
      this.props.addNewUserToConversation({ userChatId: 'LcGOCZzF1nV2jVTERsVDGvgcWeK2' });
    }
  }
  handleSend = (message) => {
    const { newConversation } = this.props;
    if (newConversation.active && newConversation.user) {
      this.props.sendMessage({ to: newConversation.user, message, isNew: true });
    }
  }
  render() {
    return (
      <div className={s.viewChat}>
        <div className={s.messagesList}>
          Haha
        </div>
        <div className={s.editor}>
          <ChatEditor handleAction={this.handleSend} />
        </div>
      </div>
    );
  }
}

export default withStyles(s)(ConversationView);
