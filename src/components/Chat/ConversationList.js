import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { connect } from 'react-redux';
import s from './Conversation.scss';
import ConversationItem from './ConversationItem';
import * as chatActions from '../../actions/chat';
import Loading from '../Loading';

@connect(
  state => ({
    user: state.chat.user,
    newChat: state.chat.newChat,
    current: state.chat.current,
    conversations: state.chat.conversations,
  }),
  { ...chatActions },
)
class ConversationList extends React.Component {
  static propTypes = {
    user: PropTypes.object,
    newChat: PropTypes.object,
    current: PropTypes.string,
    conversations: PropTypes.array,
    activeNewChat: PropTypes.func.isRequired,
    getConversations: PropTypes.func.isRequired,
    activeConversation: PropTypes.func.isRequired,
    handleToggleChatView: PropTypes.func.isRequired,
  }
  componentWillMount() {
    const { user, getConversations, current, newChat, activeConversation, conversations } = this.props;
    if (user && user.uid) {
      getConversations();
      if (!current && !newChat.active && conversations && conversations[0]) {
        activeConversation(conversations[0]);
      }
    }
  }
  componentWillReceiveProps(nextProps) {
    const { user, getConversations, activeConversation } = this.props;
    const { conversations, current, newChat } = nextProps;
    if (nextProps.user && nextProps.user !== user) {
      getConversations();
    }
    if (nextProps.user && !current && !newChat.active && conversations && conversations[0]) {
      activeConversation({ conversation: conversations[0] });
    }
  }
  handleActiveConversation = conversation => () => {
    this.props.handleToggleChatView();
    this.props.activeConversation(conversation);
  }
  handleActiveNewChat = () => {
    this.props.handleToggleChatView();
    this.props.activeNewChat(true);
  }
  render() {
    const { newChat, conversations, current, user } = this.props;
    return (
      <div className={s.conversations}>
        <div className={s.header}>
          <span>
            <i className="fa fa-sliders" />
          </span>
          <span>Messenger</span>
          <span>
            <i className="fa fa-pencil-square-o" onClick={this.handleActiveNewChat} />
          </span>
        </div>
        <div className={s.search}>
          <span>
            <label htmlFor="search">
              <input id="search" placeholder="Search Messenger" />
            </label>
          </span>
        </div>
        <div className={s.listConversation}>
          <Loading show={!user} />
          {
            newChat && newChat.active &&
            <ConversationItem conversation={newChat} active />
          }
          {
            conversations && conversations.map(conversation =>
              <ConversationItem
                key={Object.keys(conversation)[0]}
                onClick={this.handleActiveConversation({ conversation })}
                conversation={conversation}
                active={Object.keys(conversation)[0] === current}
              />,
            )
          }
        </div>
      </div>
    );
  }
}

export default withStyles(s)(ConversationList);