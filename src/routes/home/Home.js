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
import { Button, ButtonToolbar } from 'react-bootstrap';
import gql from 'graphql-tag';
import Post from '../../components/Post';
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
}
`;

class Home extends React.Component {
  static propTypes = {
    data: PropTypes.shape({
      loading: PropTypes.bool.isRequired,
    }).isRequired,
  };

  render() {
    const { data: { loading, feeds } } = this.props;
    console.log(feeds.edges, 'feeds.edges');
    return (
      <div className={s.root}>
        <div className={s.container}>
          <h1>My feeds</h1>
          <a href="/logout"> logout </a>
          {loading && <h1 style={{textAlign: 'center'}}>LOADING</h1>}
          {feeds && feeds.edges && <div>
            {feeds.edges.map((item, k) => (
              <Post key={k} data={item} />
            ))}
          </div>}
        </div>
      </div>
    );
  }
}

export default compose(
  withStyles(s),
  graphql(homePageQuery, {
    options: (props) => {
      return {
        variables:{
          cursor: null,
        },
      };
    },
    props: ({ ownProps, data }) => {
      const  { fetchMore } = data;
      const loadMoreRows = () => {
        return fetchMore({
          variables:{
            cursor: data.feeds.pageInfo.endCursor,
          },
          updateQuery:(previousResult, { fetchMoreResult })=> {
            const newEdges = fetchMoreResult.data.feeds.edges;
            const pageInfo = fetchMoreResult.data.feeds.pageInfo;
            return {
              feeds:{
                edges:[...previousResult.feeds.edges, ...newEdges],
                pageInfo
              }
            };
          }
        });
      };
      return {
        data,
        loadMoreRows
      };
    }
  }),
)(Home);
