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
import InfiniteScroll from 'react-infinite-scroller';

import Post from '../../components/Post';
import FriendSuggestions from '../../components/FriendSuggestions';
import NewPost from '../../components/NewPost';
import s from './Home.css';

const post = gql`
  fragment PostView on PostSchemas {
    _id,
    message,
    user {
      _id,
      username,
      profile {
        picture,
        firstName,
        lastName
      }
    },
    totalLikes,
    totalComments,
    isLiked,
  }
`;

const homePageQuery = gql`query homePageQuery ($cursor: String) {
  feeds (cursor: $cursor) {
    edges {
      ...PostView
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
      lastName
    }
  }
}
${post}
`;

const createNewPost = gql`mutation createNewPost ($message: String!) {
  createNewPost(message: $message) {
    ...PostView
  }
}
${post}`;

const likePost = gql`mutation likePost ($postId: String!) {
  likePost(postId: $postId) {
    ...PostView
  }
}
${post}`;

const unlikePost = gql`mutation unlikePost ($postId: String!) {
  unlikePost(postId: $postId) {
    ...PostView
  }
}
${post}`;

const FeedList = ({ feeds, likePostEvent, unlikePostEvent }) => (
  <div>
    {feeds.map(item => (
      <Post key={item._id} data={item} likePostEvent={likePostEvent} unlikePostEvent={unlikePostEvent} />
    ))}
  </div>
);

FeedList.propTypes = {
  feeds: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
    }),
  ).isRequired,
  likePostEvent: PropTypes.func.isRequired,
  unlikePostEvent: PropTypes.func.isRequired,
};

class Home extends React.Component {
  static propTypes = {
    data: PropTypes.shape({
      loading: PropTypes.bool.isRequired,
    }).isRequired,
    createNewPost: PropTypes.func.isRequired,
    loadMoreRows: PropTypes.func.isRequired,
    likePost: PropTypes.func.isRequired,
    unlikePost: PropTypes.func.isRequired,
  };

  render() {
    const { data: { loading, feeds }, loadMoreRows } = this.props;
    const { pageInfo: { hasNextPage } } = feeds;
    return (
      <div className={s.root}>
        <Row className={s.container}>
          <Col>
            <h1>My feeds</h1>
            <a href="/logout"> logout </a>
          </Col>
          <Col className={s.feedsContent}>
            {loading && <h1 style={{ textAlign: 'center' }}>LOADING</h1>}
            <NewPost createNewPost={this.props.createNewPost} />
            <InfiniteScroll
              loadMore={loadMoreRows}
              hasMore={hasNextPage}
              loader={<div className="loader">Loading ...</div>}
            >
              <FeedList feeds={feeds.edges} likePostEvent={this.props.likePost} unlikePostEvent={this.props.unlikePost} />
            </InfiniteScroll>
          </Col>

          <MediaQuery minDeviceWidth={992} values={{ deviceWidth: 1600 }}>
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
            totalLikes: 0,
            totalComments: 0,
            isLiked: false,
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
  graphql(likePost, {
    props: ({ ownProps, mutate }) => ({
      likePost: (postId, message, totalLikes, totalComments) => mutate({
        variables: { postId },
        optimisticResponse: {
          __typename: 'Mutation',
          likePost: {
            __typename: 'PostSchemas',
            _id: postId,
            message,
            user: {
              __typename: 'UserSchemas',
              _id: ownProps.data.me._id,
              username: ownProps.data.me.username,
              profile: ownProps.data.me.profile,
            },
            totalLikes: totalLikes + 1,
            totalComments,
            isLiked: true,
          },
        },
        updateQueries: {
          homePageQuery: (previousResult, { mutationResult }) => {
            const updatedPost = mutationResult.data.likePost;
            const index = previousResult.feeds.edges.findIndex(item => item._id === updatedPost._id);
            return update(previousResult, {
              feeds: {
                edges: {
                  $splice: [[index, 1, updatedPost]],
                },
              },
            });
          },
        },
      }),
    }),
  }),
  graphql(unlikePost, {
    props: ({ ownProps, mutate }) => ({
      unlikePost: (postId, message, totalLikes, totalComments) => mutate({
        variables: { postId },
        optimisticResponse: {
          __typename: 'Mutation',
          unlikePost: {
            __typename: 'PostSchemas',
            _id: postId,
            message,
            user: {
              __typename: 'UserSchemas',
              _id: ownProps.data.me._id,
              username: ownProps.data.me.username,
              profile: ownProps.data.me.profile,
            },
            totalLikes: totalLikes - 1,
            totalComments,
            isLiked: false,
          },
        },
        updateQueries: {
          homePageQuery: (previousResult, { mutationResult }) => {
            const updatedPost = mutationResult.data.unlikePost;
            const index = previousResult.feeds.edges.findIndex(item => item._id === updatedPost._id);
            return update(previousResult, {
              feeds: {
                edges: {
                  $splice: [[index, 1, updatedPost]],
                },
              },
            });
          },
        },
      }),
    }),
  }),
)(Home);
