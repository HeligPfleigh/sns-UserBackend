import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import Loading from '../../components/Loading';
import FriendList from '../../components/Friend/FriendList';
import { ACCEPTED } from '../../constants';
import s from './Conversation.scss';

const friendsPageQuery = gql`query friendsPageQuery {
  me {
    _id,
    username,
    profile {
      picture,
      firstName,
      lastName
    }
    friends {
      _id
      profile {
        picture,
        firstName,
        lastName
      }
    }
  }
}
`;

@graphql(friendsPageQuery)
class NewMessage extends React.Component {
  static propTypes = {
    data: PropTypes.shape({
      loading: PropTypes.bool.isRequired,
    }).isRequired,
  };

  render() {
    const { data: { loading, me } } = this.props;
    return (
      <div className={s.toNewMess}>
        <div>
          <label htmlFor="searchToMess">To:</label>
          <input id="searchToMess" ref={(node) => { this.input = node; }} placeholder="Type a name of friend..." />
        </div>
        <div>
          <Loading show={loading} />
          {
            me && me.friends &&
            <FriendList friends={me.friends} friendType={ACCEPTED} handleFriendAction={this.handleFriendAction} />
          }
        </div>
      </div>
    );
  }
}

export default withStyles(s)(NewMessage);
