import React, { PropTypes } from 'react';
import { Image, Col, Clearfix } from 'react-bootstrap';
import { convertFromRaw } from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import TimeAgo from 'react-timeago';
import vnStrings from 'react-timeago/lib/language-strings/en';
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter';
import { goToAnchor } from 'react-scrollable-anchor';

import s from './Post.css';
import CommentList from '../Comments/CommentList';

const formatter = buildFormatter(vnStrings);

class Post extends React.Component {
  static propTypes = {
    data: PropTypes.shape({
      _id: PropTypes.string,
      message: PropTypes.string,
      user: PropTypes.object,
    }),
    likePostEvent: PropTypes.func.isRequired,
    unlikePostEvent: PropTypes.func.isRequired,
    userInfo: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      isFocus: false,
    };
  }

  onClickCommentBtn = (e) => {
    e.preventDefault();
    this.setState({
      isFocus: !this.state.isFocus,
    });
    const { data: { _id } } = this.props;
    goToAnchor(`#add-comment-${_id}`);
  }

  render() {
    const {
      data: {
        _id,
        message,
        totalLikes,
        totalComments,
        isLiked,
        user,
        createdAt,
      },
      likePostEvent,
      unlikePostEvent,
      userInfo,
    } = this.props;

    return (
      <div className={s.postPanel}>
        <Col className={s.postHeaderLeft}>
          <div>
            <span className="hide">{_id}</span>
            <a href="#">
              <Image src={user.profile.picture} circle />
            </a>
          </div>
          <div>
            <a href="#">
              <strong>{`${user.profile.firstName} ${user.profile.lastName}`}</strong>
            </a>
            <br />
            <TimeAgo date={createdAt} formatter={formatter} />
          </div>
        </Col>
        <Col className={s.postHeaderRight}>
          <i className="fa fa-angle-down fa-lg" aria-hidden="true"></i>
        </Col>
        <Clearfix />
        <Col
          className={s.postContent}
          dangerouslySetInnerHTML={{ __html: stateToHTML(convertFromRaw(JSON.parse(message))) }}
        />
        <Col className={s.postStatistic}>
          <a href="#">{ totalLikes } Thích</a>
          <a href="#">{ totalComments } Bình luận</a>
        </Col>
        <Col className={s.postControl}>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (!isLiked) {
                likePostEvent(_id, message, totalLikes, totalComments, user);
              } else {
                unlikePostEvent(_id, message, totalLikes, totalComments, user);
              }
            }}
          >
            <i className={`${isLiked ? s.likeColor : 'fa-heart-o'} fa fa-heart fa-lg`} aria-hidden="true"></i>&nbsp;
            <span>Thích</span>
          </a>
          <a href="#" onClick={this.onClickCommentBtn}>
            <i className="fa fa-comments-o fa-lg" aria-hidden="true"></i>&nbsp;
            <span>Bình luận</span>
          </a>

          <a href="#" onClick={(e) => { e.preventDefault(); }}>
            <i className="fa fa-share fa-lg" aria-hidden="true"></i>&nbsp;
            <span>Chia sẻ</span>
          </a>
        </Col>
        <Col className={s.commentPanel}>
          <CommentList isFocus={this.state.isFocus} postId={_id} user={userInfo} />
        </Col>
      </div>
    );
  }
}

export default withStyles(s)(Post);
