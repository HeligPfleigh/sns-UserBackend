import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { Button, ButtonToolbar } from 'react-bootstrap';
import { PENDDING, NONE } from '../../constants';
import s from './FriendStyle.scss';

class Friend extends React.Component {
  static propTypes = {
    friend: PropTypes.object.isRequired,
    handleAccept: PropTypes.func,
    handleReject: PropTypes.func,
    handleAddFriend: PropTypes.func,
    friendType: PropTypes.string.isRequired,
  }
  render() {
    const { friend, handleAccept, handleReject, handleAddFriend, friendType } = this.props;
    return (
      <div className={s.friend}>
        <div className={s.friendAvata}>
          <img alt={friend.profile && friend.profile.firstName} src={friend.profile && friend.profile.picture} />
        </div>
        <div className={s.friendInfo}>
          <div className={s.friendName}>
            <span>{friend.profile.firstName} {friend.profile.lastName}</span>
            <span>10 other mutual friends</span>
          </div>
          {
            friendType === PENDDING &&
            <ButtonToolbar>
              <Button onClick={() => handleAccept(friend._id)} bsStyle="primary">Confirm</Button>
              <Button onClick={() => handleReject(friend._id)} >Delete Request</Button>
            </ButtonToolbar>
          }
          {
            friendType === NONE &&
            <ButtonToolbar>
              <Button onClick={() => handleAddFriend(friend._id)} bsStyle="primary">Add Friend</Button>
            </ButtonToolbar>
          }
        </div>
      </div>
    );
  }
}

export default withStyles(s)(Friend);
