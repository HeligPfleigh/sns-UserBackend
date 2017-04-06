import React, { PropsType } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './FriendStyle.scss';

class Friend extends React.Component {
  static propsType = {
    friend: PropsType.object.isRequired,
  }
  render() {
    return (
      <div className={s.friendListRequest}>
      </div>
    );
  }
}

export default withStyles(s)(Friend);
