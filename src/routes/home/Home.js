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
import { Row, Col } from 'react-bootstrap';
import gql from 'graphql-tag';
import update from 'immutability-helper';
import MediaQuery from 'react-responsive';
import Post from '../../components/Post';
import FriendSuggestions from '../../components/FriendSuggestions';
import NewPost from '../../components/NewPost';
import s from './Home.css';

const homePageQuery = gql`query homePageQuery ($cursor: String) {
  feeds (cursor: $cursor) {
    edges {
      _id,
      message,
      user {
        _id,
        username,
        profile {
          picture,
          firstName,
          lastName,
          gender
        }
      }
    }
    pageInfo {
      endCursor,
      hasNextPage
    }
  }
  me {
    _id,
    username,
    profile {
      picture,
      firstName,
      lastName,
      gender
    }
  }
}
`;

const createNewPost = gql`mutation createNewPost ($message: String!) {
  createNewPost(message: $message) {
    _id,
    message,
    user {
      _id,
      username,
      profile {
        picture,
        firstName,
        lastName,
        gender
      }
    }
  }
}`;

class Home extends React.Component {
  static propTypes = {
    data: PropTypes.shape({
      loading: PropTypes.bool.isRequired,
    }).isRequired,
    createNewPost: PropTypes.func.isRequired,
    loadMoreRows: PropTypes.func.isRequired,
  };

  state = {
    value: '',
  }

  onSubmit = () => {
    this.props.createNewPost(this.state.value);
    this.setState({ value: '' });
  }

  handleChange = (e) => {
    this.setState({ value: e.target.value });
  }


  render() {
    const { data: { loading, feeds }, loadMoreRows } = this.props;
    return (
      <div className={s.root}>
        <Row className={s.container}>
          <Col>
            <h1>My feeds</h1>
            <a href="/logout"> logout </a>
          </Col>
          <Col className={s.feedsContent}>
            {loading && <h1 style={{ textAlign: 'center' }}>LOADING</h1>}
            <NewPost
              value={this.state.value}
              handleChange={this.handleChange}
              createNewPost={this.props.createNewPost}
            />
            {feeds && feeds.edges && <div>
              {feeds.edges.map(item => (
                <Post key={item._id} data={item} />
              ))}
            </div>}
            <button onClick={loadMoreRows}>Load More</button>
          </Col>

          <MediaQuery query="(min-width: 992px)">
            <FriendSuggestions />
          </MediaQuery>
        </Row>
      </div>
    );
  }
}

export default compose(
  withStyles(s),
  graphql(homePageQuery, {
    options: props => ({
      variables: {
        ...props,
        cursor: null,
      },
    }),
    props: ({ data }) => {
      const { fetchMore } = data;
      const loadMoreRows = () => fetchMore({
        variables: {
          cursor: data.feeds.pageInfo.endCursor,
        },
        updateQuery: (previousResult, { fetchMoreResult }) => {
          const newEdges = fetchMoreResult.data.feeds.edges;
          const pageInfo = fetchMoreResult.data.feeds.pageInfo;
          return {
            feeds: {
              edges: [...previousResult.feeds.edges, ...newEdges],
              pageInfo,
            },
          };
        },
      });
      return {
        data,
        loadMoreRows,
      };
    },
  }),
  graphql(createNewPost, {
    props: ({ ownProps, mutate }) => ({
      createNewPost: message => mutate({
        variables: { message },
        optimisticResponse: {
          __typename: 'Mutation',
          createNewPost: {
            __typename: 'PostSchemas',
            _id: 'TENPORARY_ID_OF_THE_POST_OPTIMISTIC_UI',
            message,
            user: {
              __typename: 'UserSchemas',
              _id: ownProps.data.me._id,
              username: ownProps.data.me.username,
              profile: ownProps.data.me.profile,
            },
          },
        },
        updateQueries: {
          homePageQuery: (previousResult, { mutationResult }) => {
            const newPost = mutationResult.data.createNewPost;
            return update(previousResult, {
              feeds: {
                edges: {
                  $unshift: [newPost],
                },
              },
            });
          },
        },
      }),
    }),
  }),
)(Home);
