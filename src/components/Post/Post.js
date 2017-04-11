import React, { PropTypes } from 'react';
import { Image, Col, Clearfix } from 'react-bootstrap';
import { convertFromRaw } from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Post.css';

const Post = ({ data: { _id, message, totalLikes, totalComments, isLiked, user }, likePostEvent, unlikePostEvent }) => (
  <div className={s.postPanel}>
    <Col className={s.postHeaderLeft}>
      <span className="hide">{_id}</span>
      <a href="#">
        <Image src={user.profile.picture} circle />
      </a>
      <a href="#">
        <strong>{`${user.profile.firstName} ${user.profile.lastName}`}</strong>
      </a>
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
            likePostEvent(_id, message, totalLikes, totalComments);
          } else {
            unlikePostEvent(_id, message, totalLikes, totalComments);
          }
        }}
      >
        <i className={`${isLiked ? s.likeColor : 'fa-heart-o'} fa fa-heart fa-lg`} aria-hidden="true"></i>&nbsp;
        <span>Thích</span>
      </a>
      <a href="#">
        <i className="fa fa-comments-o fa-lg" aria-hidden="true"></i>&nbsp;
        <span>Bình luận</span>
      </a>

      <a href="#">
        <i className="fa fa-share fa-lg" aria-hidden="true"></i>&nbsp;
        <span>Chia sẻ</span>
      </a>
    </Col>
    <div>
    </div>
  </div>
);

Post.propTypes = {
  data: PropTypes.shape({
    _id: PropTypes.string,
    message: PropTypes.string,
    user: PropTypes.object,
  }),
  likePostEvent: PropTypes.func.isRequired,
  unlikePostEvent: PropTypes.func.isRequired,
};

Post.defaultProps = {
  data: {},
};

export default withStyles(s)(Post);
