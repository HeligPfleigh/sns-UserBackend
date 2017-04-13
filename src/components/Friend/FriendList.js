import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import Friend from './Friend';
import s from './FriendStyle.scss';
import { PENDING } from '../../constants';

class FriendList extends React.Component {
  static propTypes = {
    friends: PropTypes.array.isRequired,
    handleFriendAction: PropTypes.func,
  }
  render() {
    const { friends, ...customs } = this.props;
    const { friendType } = customs;

   // const styleNofriend = friends.length > 0 ? s.friendList : s.friendListHide;
    return (
      <div className={s.friendList}>
        {
          friendType === PENDING &&
          <h4>
            Respond to Your {friends.length} Friend Requests
          </h4>
        }
        <ul>
          {
            friends.map(friend => <li key={friend._id}><Friend friend={friend} {...customs} /></li>)
          }
        </ul>
      </div>
    );
  }
}

export default withStyles(s)(FriendList);
