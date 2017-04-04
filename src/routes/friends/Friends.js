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
import { Row, Col, Button } from 'react-bootstrap';
import gql from 'graphql-tag';
import update from 'immutability-helper';
import s from './Friends.css';

update.extend('$unset', (_idsToRemove, original) => original.filter(v => _idsToRemove.indexOf(v._id) === -1));

const UsersList = ({ users, acceptFriend, rejectFriend }) => (
  <div>
    {users.map(user => (
      <Col key={user._id}>
        <strong>{`${user.profile.firstName} ${user.profile.lastName}`}</strong>
        <Button onClick={acceptFriend && acceptFriend(user._id)}>Accept</Button>
        <Button onClick={rejectFriend && rejectFriend(user._id)}>Reject</Button>
      </Col>
    ))}
  </div>
);

UsersList.propTypes = {
  users: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string,
  })).isRequired,
  acceptFriend: PropTypes.func,
  rejectFriend: PropTypes.func,
};

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
    friendRequests {
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

const acceptFriend = gql`mutation acceptFriend ($userId: String!) {
  acceptFriend(userId: $userId) {
    _id,
  }
}`;

class Friends extends React.Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    data: PropTypes.shape({
      loading: PropTypes.bool.isRequired,
    }).isRequired,
    acceptFriend: PropTypes.func.isRequired,
  };

  acceptFriend = id => (evt) => {
    evt.preventDefault();
    this.props.acceptFriend(id);
  }

  rejectFriend = id => (evt) => {
    evt.preventDefault();
    alert(id);
  }

  render() {
    const { data: { loading, me } } = this.props;
    return (
      <div className={s.root}>
        <Row className={s.container}>
          <h1>{this.props.title}</h1>
          {loading && <h1 style={{ textAlign: 'center' }}>LOADING</h1>}
          <h1> Friends </h1>
          { me && me.friends && <UsersList users={me.friends} /> }
          <h1> Friend Requests </h1>
          { me && me.friendRequests && <UsersList
            users={me.friendRequests}
            acceptFriend={this.acceptFriend}
            rejectFriend={this.rejectFriend}
          /> }
        </Row>
      </div>
    );
  }
}

export default compose(
  withStyles(s),
  graphql(friendsPageQuery),
  graphql(acceptFriend, {
    props: ({ mutate }) => ({
      acceptFriend: userId => mutate({
        variables: { userId },
        updateQueries: {
          friendsPageQuery: (previousResult, { mutationResult }) => {
            const newFriend = mutationResult.data.acceptFriend;
            return update(previousResult, {
              me: {
                friends: {
                  $unshift: [newFriend],
                },
                friendRequests: {
                  $unset: [newFriend._id],
                },
              },
            });
          },
        },
      }),
    }),
  }),
)(Friends);
