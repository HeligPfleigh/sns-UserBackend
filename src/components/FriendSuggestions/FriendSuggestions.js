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
import { Button, Image, Col, Clearfix } from 'react-bootstrap';
import s from './FriendSuggestions.css';

const UsersList = ({ users, addFriend }) => (
  <div>
    {users.map(user => (
      <Col className={s.suggestFriendItem} key={user._id}>
        <div className={s.friendItemLeft}>
          <a href="#"><Image src={user.profile.picture} circle /></a>
        </div>
        <div className={s.friendItemRight}>
          <a href="#"><strong>{`${user.profile.firstName} ${user.profile.lastName}`}</strong></a>
          <br />
          <Button bsSize="xsmall" onClick={addFriend(user._id)}>
            <i className="fa fa-user-plus" aria-hidden="true"></i>&nbsp; Kết bạn
          </Button>
        </div>
        <Clearfix />
      </Col>
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
        firstName
        lastName
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
      <Col className={s.friendSuggestion}>
        {loading && <h1 style={{ textAlign: 'center' }}>LOADING</h1>}
        {!loading && me && <UsersList addFriend={this.addFriend} users={me.friendSuggestions} />}
      </Col>
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
