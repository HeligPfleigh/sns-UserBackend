import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';
import update from 'immutability-helper';
import { Clearfix } from 'react-bootstrap';
import ScrollableAnchor, { configureAnchors } from 'react-scrollable-anchor';

import s from './CommentStyle.scss';
import CommentItem from './CommentItem';
import NewComment from '../NewComment/NewComment';

configureAnchors({ offset: -160, scrollDuration: 200 });

const userFragment = gql`
  fragment UserView on UserSchemas {
    _id,
    username,
    profile {
      picture,
      firstName,
      lastName
    }
  }
`;

const commentFragment = gql`fragment CommentView on CommentSchemas {
    _id,
    message,
    user {
      ...UserView
    },
    parent,
    updatedAt,
  }
  ${userFragment}
`;

const loadCommentsQuery = gql`query loadCommentsQuery ($postId: String) {
  post (_id: $postId) {
    _id
    comments {
      _id
      message
      user {
        ...UserView,
      },
      parent,
      reply {
        ...CommentView
      },
      updatedAt,
    }
  }
}
${userFragment}
${commentFragment}`;


const createNewComment = gql`
  mutation createNewComment (
    $postId: String!,
    $message: String!,
    $commentId: String,
  ) {
    createNewComment(
      postId: $postId,
      message: $message,
      commentId: $commentId,
    ) {
      ...CommentView
      reply {
        ...CommentView
      },
    }
  }
${commentFragment}`;

class CommentList extends React.Component {
  static propTypes = {
    data: PropTypes.shape({
      loading: PropTypes.bool.isRequired,
    }).isRequired,
    postId: PropTypes.string.isRequired,
    isFocus: PropTypes.bool.isRequired,
    user: PropTypes.object.isRequired,
    createNewComment: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      commentId: null,
      isSubForm: false,
    };
  }

  showCommentForm = ({ _id, parent, user }) => {
    const content = `@${user.username} - `;
    this.setState({
      initContent: parent ? content : '',
      commentId: parent || _id,
      isSubForm: !this.setState.isSubForm,
    });
  }

  render() {
    const { data: { loading, post }, postId, isFocus, user } = this.props;
    const { initContent, commentId, isSubForm } = this.state;
    return (
      <div>
        {loading && <h1 style={{ textAlign: 'center' }}>LOADING</h1>}
        {post && post.comments.map(item => (
          <span key={item._id}>
            <CommentItem comment={item} showCommentForm={this.showCommentForm} />
            {item && item.reply && item.reply.map(_item => (
              <span className={s.subComment} key={_item._id}>
                <CommentItem comment={_item} showCommentForm={this.showCommentForm} />
              </span>
            ))}
            { commentId === item._id && <ScrollableAnchor id={`#add-comment-${item._id}`}>
              <span className={s.subComment}>
                <NewComment
                  initContent={initContent}
                  commentId={commentId}
                  isFocus={isSubForm}
                  user={user}
                  postId={postId}
                  createNewComment={this.props.createNewComment}
                />
              </span>
            </ScrollableAnchor> }
          </span>
        ))}
        <Clearfix />
        <ScrollableAnchor id={`#add-comment-${postId}`}>
          <NewComment isFocus={isFocus} user={user} postId={postId} createNewComment={this.props.createNewComment} />
        </ScrollableAnchor>
      </div>
    );
  }
}

export default compose(
  withStyles(s),
  graphql(loadCommentsQuery, {
    options: props => ({
      variables: {
        ...props,
        postId: props.postId,
      },
      // fetchPolicy: 'cache-only',
    }),
  }),
  graphql(createNewComment, {
    props: ({ mutate }) => ({
      createNewComment: (postId, message, commentId) => mutate({
        variables: { postId, message, commentId },
        updateQueries: {
          loadCommentsQuery: (previousResult, { mutationResult }) => {
            const newComment = mutationResult.data.createNewComment;
            if (previousResult.post._id === postId) {
              if (commentId) {
                const index = previousResult.post.comments.findIndex(item => item._id === commentId);
                const commentItem = previousResult.post.comments[index];

                // init reply value
                if (!commentItem.reply) {
                  commentItem.reply = [];
                }

                // push value into property reply
                commentItem.reply.push(newComment);

                return update(previousResult, {
                  post: {
                    comments: {
                      $splice: [[index, 1, commentItem]],
                    },
                  },
                });
              }
              return update(previousResult, {
                post: {
                  comments: {
                    $push: [newComment],
                  },
                },
              });
            }
            return previousResult;
          },
        },
      }),
    }),
  }),
)(CommentList);
