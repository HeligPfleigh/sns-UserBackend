import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Scrollbars } from 'react-custom-scrollbars';
import s from './Conversation.scss';
import ChatEditor from './ChatEditor';
import Message from './Message';
import NewMessage from './NewMessage';
import { sendMessage } from '../../actions/chat';
import { formatStatus } from '../../utils/time';

@connect(
  state => ({
    chatState: state.chat,
  }),
  { sendMessage },
)
class ConversationView extends React.Component {
  static propTypes = {
    chatState: PropTypes.object,
    sendMessage: PropTypes.func.isRequired,
    handleToggleChatView: PropTypes.func.isRequired,
  };
  componentDidUpdate() {
    this.scrollMessages.scrollTop(this.scrollMessages.getScrollHeight());
  }
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
    const { chatState: { user, current, conversations, messages, newChat, online } } = this.props;
    const activeConversation = _.find(conversations, o => _.has(o, current));
    let receiver = activeConversation && Object.values(activeConversation)[0] && Object.values(activeConversation)[0].receiver;
    const members = [user, receiver];
    const messagesOnChat = messages && messages[current];
    if (!receiver) {
      receiver = newChat && newChat.receiver;
    }
    const statusOnline = online && receiver && receiver.uid && online[receiver.uid];
    return (
      <div className={s.viewChat}>
        <div className={s.chatHeader}>
          <div className={s.navigationMb}>
            <i className="fa fa-arrow-left" aria-hidden="true" onClick={() => this.props.handleToggleChatView()}></i>
            {
              receiver ? <div>
                {
                  statusOnline === true &&
                  <span className={s.online} />
                }
                <span>{`${receiver.profile.firstName} ${receiver.profile.lastName}`}</span>
                {
                  statusOnline !== true &&
                  <span className={s.offline}>
                    {formatStatus(statusOnline)}
                  </span>
                }
              </div>
              : <span>New message</span>
            }
          </div>
          {
            !current && newChat && newChat.active && !newChat.receiver &&
            <NewMessage />
          }
          {
            receiver &&
            <div className={s.chatStatus}>
              <div>
                {
                  statusOnline === true &&
                  <span className={s.online} />
                }
                <span>{`${receiver.profile.firstName} ${receiver.profile.lastName}`}</span>
                {
                  statusOnline !== true &&
                  <span className={s.offline}>
                    {formatStatus(statusOnline)}
                  </span>
                }
              </div>
            </div>
          }
        </div>
        <div className={s.messagesList}>
          <Scrollbars
            style={{ height: '100vh' }}
            universal
            autoHide
            ref={(node) => { this.scrollMessages = node; }}
          >
            {
              messagesOnChat && messagesOnChat.map(message => <Message key={Object.keys(message)[0]} members={members} message={message} />)
            }
          </Scrollbars>
        </div>
        <div className={s.editor}>
          <ChatEditor handleAction={this.handleSend} />
        </div>
      </div>
    );
  }
}

export default withStyles(s)(ConversationView);
