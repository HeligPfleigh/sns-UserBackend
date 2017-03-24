import React, { PropTypes } from 'react';
import { Image } from 'react-bootstrap';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Post.css';

const Post = ({ data: { _id, message, user } }) => (
  <div className={s.title}>
    <hr />
    {`message: ${message}`}<br />
    <div>
      user<br />
      <span className="hide">{_id}</span>
      <Image src={user.profile.picture} rounded /><br />
      firstName: {user.profile.firstName}<br />
      lastName: {user.profile.lastName}<br />
      gender: {user.profile.gender}<br />
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
