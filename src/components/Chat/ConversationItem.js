import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import classnames from 'classnames';
import s from './Conversation.scss';

class ConversationItem extends React.Component {
  static propTypes = {
    conversation: PropTypes.object,
  }
  render() {
    const { conversation } = this.props;
    const name = conversation && `${conversation.profile.firstName} ${conversation.profile.lastName}`;
    const picture = conversation && conversation.profile && conversation.profile.picture;
    return (
      <div className={classnames(s.conversationItem, { [s.activeNew]: !conversation })}>
        <div className={s.friendAvata}>
          <img alt={name} src={picture || '/tile.png'} />
        </div>
        <div className={s.friendInfo}>
          <div className={s.friendName}>
            <span>{name || 'New message'}</span>
            {
              conversation && conversation.lastMessage &&
              <span>{conversation.lastMessage}</span>
            }
          </div>
          {
            conversation && conversation.timestamp &&
            <div className={s.lastTime}>
              {conversation.timestamp}
            </div>
          }
        </div>
      </div>
    );
  }
}

export default withStyles(s)(ConversationItem);
