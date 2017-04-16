import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { Button, ButtonToolbar } from 'react-bootstrap';
import { PENDING, NONE, ACCEPTED, REJECTED } from '../../constants';
import s from './FriendStyle.scss';

class Friend extends React.Component {
  static propTypes = {
    friend: PropTypes.object.isRequired,
    handleFriendAction: PropTypes.func,
    friendType: PropTypes.string.isRequired,
  }
  handleClickFriend = () => {
    const { friend, handleFriendAction, friendType } = this.props;
    if (friendType === ACCEPTED) {
      handleFriendAction(friend);
    }
  }
  render() {
    const { friend, handleFriendAction, friendType } = this.props;
    return (
      <div className={s.friend} onClick={this.handleClickFriend}>
        <div className={s.friendAvata}>
          <img alt={friend.profile && friend.profile.firstName} src={friend.profile && friend.profile.picture} />
        </div>
        <div className={s.friendInfo}>
          <div className={s.friendName}>
            <span>{friend.profile.firstName} {friend.profile.lastName}</span>
            {
              friendType !== ACCEPTED &&
              <span>10 other mutual friends</span>
            }
          </div>
          {
            friendType === PENDING &&
            <ButtonToolbar>
              <Button onClick={() => handleFriendAction(friend._id, ACCEPTED)} bsStyle="primary">Confirm</Button>
              <Button onClick={() => handleFriendAction(friend._id, REJECTED)} >Delete Request</Button>
            </ButtonToolbar>
          }
          {
            friendType === NONE &&
            <ButtonToolbar className={s.addFriend}>
              <Button onClick={() => handleFriendAction(friend._id, PENDING)} bsStyle="primary" bsSize="xsmall">
                <i className="fa fa-user-plus" />
                Add Friend
              </Button>
            </ButtonToolbar>
          }
        </div>
      </div>
    );
  }
}

export default withStyles(s)(Friend);
