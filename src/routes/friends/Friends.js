import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import update from 'immutability-helper';
import { Grid, Row, Col } from 'react-bootstrap';
import Loading from '../../components/Loading';
import FriendList from '../../components/Friend/FriendList';
import { PENDDING } from '../../constants';
import s from './Friends.scss';

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

@graphql(friendsPageQuery)
@graphql(acceptFriend, { name: 'acceptFriend' })
class Friends extends React.Component {
  static propTypes = {
    acceptFriend: PropTypes.func.isRequired,
    data: PropTypes.shape({
      loading: PropTypes.bool.isRequired,
    }).isRequired,
  }
  constructor() {
    super();
    update.extend('$unset', (_idsToRemove, original) => original.filter(v => _idsToRemove.indexOf(v._id) === -1));
  }
  handleAccept = (userId) => {
    this.props.acceptFriend({
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
    });
  }
  render() {
    const { data: { loading, me } } = this.props;
    return (
      <Grid>
        <Loading show={loading} />
        <Row>
          <Col md={8} xs={12}>
            {
              me && me.friendRequests &&
              <FriendList friends={me.friendRequests} friendType={PENDDING} handleAccept={this.handleAccept} />
            }
          </Col>
        </Row>
      </Grid>
    );
  }
}

export default withStyles(s)(Friends);
