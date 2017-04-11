import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { connect } from 'react-redux';
import s from './Conversation.scss';
import ConversationItem from './ConversationItem';
import { activeNewChat } from '../../actions/chat';

@connect(
  state => ({
    newConversation: state.chat.new,
  }),
  { activeNewChat },
)
class ConversationList extends React.Component {
  static propTypes = {
    newConversation: PropTypes.object,
    activeNewChat: PropTypes.func.isRequired,
  }
  render() {
    const { newConversation } = this.props;
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
            <ConversationItem />
          }
        </div>
      </div>
    );
  }
}

export default withStyles(s)(ConversationList);
