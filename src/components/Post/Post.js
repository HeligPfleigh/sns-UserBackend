import React, { PropTypes } from 'react';
import { Image, Row, Col, Clearfix } from 'react-bootstrap';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Post.css';

const Post = ({ data: { _id, message, user } }) => (
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
    <Col className={s.postContent}>
      {`message: ${message}`}
    </Col>
    <Col className={s.postStatistic}>
      <a href="#">16 Thích</a>
      <a href="#">6 Bình luận</a>
    </Col>
    <Col className={s.postControl}>
      <a href="#">
        <i className="fa fa-heart-o fa-lg" aria-hidden="true"></i>&nbsp;
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
};

Post.defaultProps = {
  data: {},
};

export default withStyles(s)(Post);
