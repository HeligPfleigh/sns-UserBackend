import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { Button, ButtonToolbar } from 'react-bootstrap';
import s from './FriendStyle.scss';

class Friend extends React.Component {
  static propTypes = {
    friend: PropTypes.object.isRequired,
    handleAccept: PropTypes.func,
    handleReject: PropTypes.func,
    status: PropTypes.string.isRequired,
  }
  render() {
    const { friend, handleAccept, handleReject } = this.props;
    return (
      <div className={s.friend}>
        <div className={s.friendInfo}>
          <div className={s.friendAvata}>
            <img alt={friend.profile && friend.profile.firstName} src={friend.profile && friend.profile.picture} />
          </div>
          <div>
            <span>{friend.profile.firstName} {friend.profile.lastName}</span>
            <span>10 other mutual friends</span>
          </div>
        </div>
        <ButtonToolbar>
          <Button onClick={() => handleAccept(friend._id)} bsStyle="primary">Confirm</Button>
          <Button onClick={() => handleReject(friend._id)} >Delete Request</Button>
        </ButtonToolbar>
      </div>
    );
  }
}

export default withStyles(s)(Friend);
