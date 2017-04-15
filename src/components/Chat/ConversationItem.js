import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import classnames from 'classnames';
import formatTime from '../../utils/time';
import s from './Conversation.scss';

class ConversationItem extends React.Component {
  static propTypes = {
    conversation: PropTypes.object,
  }
  render() {
    let { conversation, ...customs } = this.props;
    if (!conversation.receiver) {
      conversation = Object.values(conversation)[0];
    }
    const receiver = conversation && conversation.receiver;
    const meta = conversation && conversation.meta;
    const name = receiver && `${receiver.profile.firstName} ${receiver.profile.lastName}`;
    const picture = receiver && receiver.profile && receiver.profile.picture;
    return (
      <div {...customs} className={classnames(s.conversationItem, { [s.activeNew]: !conversation })}>
        <div className={s.friendAvata}>
          <img alt={name} src={picture || '/tile.png'} />
        </div>
        <div className={s.friendInfo}>
          <div className={s.friendName}>
            <span>{name || 'New message'}</span>
            {
              meta && meta.lastMessage &&
              <span dangerouslySetInnerHTML={{ __html: meta.lastMessage }} />
            }
          </div>
          {
            meta && meta.timestamp &&
            <div className={s.lastTime}>
              {formatTime(meta.timestamp)}
            </div>
          }
        </div>
      </div>
    );
  }
}

export default withStyles(s)(ConversationItem);
