import React, { PropTypes } from 'react';
import { convertFromRaw } from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
// import TimeAgo from 'react-timeago';
// import vnStrings from 'react-timeago/lib/language-strings/en';
// import buildFormatter from 'react-timeago/lib/formatters/buildFormatter';
import {
  Image,
  Col,
} from 'react-bootstrap';
import s from './CommentStyle.scss';

// const formatter = buildFormatter(vnStrings);

class CommentItem extends React.Component {
  static propTypes = {
    comment: PropTypes.object.isRequired,
    showCommentForm: PropTypes.func,
  };

  showCommentFormHandle = (e) => {
    e.preventDefault();
    const { comment } = this.props;
    this.props.showCommentForm(comment);
  }
  render() {
    const { comment } = this.props;
    return (
      <div className={s.commentPanel}>
        <Col className={s.commentAvarta}>
          <a href="#">
            <Image src={comment.user.profile.picture} circle />
          </a>
        </Col>
        <Col className={s.commentContent}>
          <Col
            dangerouslySetInnerHTML={{
              __html: `<p><a href='#'>${comment.user.profile.firstName}
              ${comment.user.profile.lastName}</a></p>
              ${stateToHTML(convertFromRaw(JSON.parse(comment.message)))}`,
            }}
          />
          <Col className={s.commentControl}>
            <a href="#">Thích</a> - <a href="#" onClick={this.showCommentFormHandle}>Trả lời</a> - <a href="#">
              { /** <TimeAgo date={comment.updatedAt} formatter={formatter} /> */ }
            </a>
          </Col>
        </Col>
      </div>
    );
  }
}

export default withStyles(s)(CommentItem);
