import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import _ from 'lodash';
import classnames from 'classnames';
import s from './Message.scss';

class Message extends React.Component {
  static propTypes = {
    message: PropTypes.object.isRequired,
    members: PropTypes.array.isRequired,
  };

  render() {
    const { message, members } = this.props;
    const messageValues = Object.values(message)[0];
    const user = _.find(members, o => o.uid === messageValues.user);
    const picture = user && user.profile && user.profile.picture;
    const isOwner = user === members[0];
    return (
      <div className={classnames(s.root, { [s.rootOwner]: isOwner })} >
        <div className={s.chatUser}>
          <img alt="Message" src={picture || '/tile.png'} />
        </div>
        <div className={s.message}>
          <div dangerouslySetInnerHTML={{ __html: messageValues && messageValues.message }} />
        </div>
      </div>
    );
  }
}

export default withStyles(s)(Message);
