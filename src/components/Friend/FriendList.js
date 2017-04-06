import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import Friend from './Friend';
import s from './FriendStyle.scss';

class FriendList extends React.Component {
  static propTypes = {
    friends: PropTypes.array.isRequired,
    handleAccept: PropTypes.func,
  }
  render() {
    const { friends, ...customs } = this.props;
    return (
      <div className={s.friendList}>
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
