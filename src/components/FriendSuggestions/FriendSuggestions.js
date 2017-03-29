/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React, { PropTypes } from 'react';
import { graphql, compose } from 'react-apollo';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import gql from 'graphql-tag';
import { Image } from 'react-bootstrap';
import s from './FriendSuggestions.css';

const UsersList = ({ users, addFriend }) => (
  <div>
    {users.map(user => (
      <div key={user._id}>
        <Image src={user.profile.picture} rounded /><br />
        <button onClick={addFriend(user._id)}> add friend </button>
      </div>
    ))}
  </div>
);

UsersList.propTypes = {
  users: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string,
  })).isRequired,
  addFriend: PropTypes.func.isRequired,
};

const friendSuggestionsQuery = gql`query friendSuggestionsQuery {
  me {
    _id
    friendSuggestions {
      _id
      profile {
        picture
      }
    }
  }
}
`;

const sendFriendRequest = gql`mutation sendFriendRequest ($_id: String!) {
  sendFriendRequest(_id: $_id) {
    _id
    profile {
      picture
    }
  }
}`;

class FriendSuggestions extends React.Component {
  static propTypes = {
    data: PropTypes.shape({
      loading: PropTypes.bool.isRequired,
    }).isRequired,
    sendFriendRequest: PropTypes.func.isRequired,
  };

  addFriend = id => (evt) => {
    evt.preventDefault();
    this.props.sendFriendRequest(id);
  }

  render() {
    const { data: { loading, me } } = this.props;
    return (
      <div>
        {loading && <h1 style={{ textAlign: 'center' }}>LOADING</h1>}
        {!loading && me && <UsersList addFriend={this.addFriend} users={me.friendSuggestions} />}
      </div>
    );
  }
}

export default compose(
  withStyles(s),
  graphql(friendSuggestionsQuery, {}),
  graphql(sendFriendRequest, {
    props: ({ mutate }) => ({
      sendFriendRequest: _id => mutate({
        variables: { _id },
        refetchQueries: [{
          query: friendSuggestionsQuery,
        }],
      }),
    }),
  }),

)(FriendSuggestions);
