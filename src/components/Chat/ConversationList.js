import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { connect } from 'react-redux';
import s from './Conversation.scss';
import ConversationItem from './ConversationItem';
import { activeNewChat, getConversations } from '../../actions/chat';

@connect(
  state => ({
    newConversation: state.chat.new,
    conversations: state.chat.conversations,
  }),
  { activeNewChat, getConversations },
)
class ConversationList extends React.Component {
  static propTypes = {
    newConversation: PropTypes.object,
    conversations: PropTypes.array,
    activeNewChat: PropTypes.func.isRequired,
    getConversations: PropTypes.func.isRequired,
  }
  componentWillMount() {
    this.props.getConversations();
  }
  render() {
    const { newConversation, conversations } = this.props;
    return (
      <div className={s.conversations}>
        <div className={s.header}>
          <span>
            <i className="fa fa-sliders" />
          </span>
          <span>Messenger</span>
          <span>
            <i className="fa fa-pencil-square-o" onClick={() => this.props.activeNewChat(true)} />
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
          {
            newConversation && newConversation.active &&
            <ConversationItem conversation={newConversation} />
          }
          {
            conversations && conversations.map(conversation => <ConversationItem conversation={conversation} />)
          }
        </div>
      </div>
    );
  }
}

export default withStyles(s)(ConversationList);
