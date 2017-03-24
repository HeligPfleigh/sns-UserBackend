import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Post.css';
import { Image } from 'react-bootstrap';

const Post = ({ data: { _id, message, user } }) => (
  <div className={s.title}>
    <hr />
    {`_id: ${_id}`} <br />
    {`message: ${message}`}<br />
    <div>
            user<br />
      <Image src={user.profile.picture} rounded /><br />
            firstName: {user.profile.firstName}<br />
            lastName: {user.profile.lastName}<br />
            gender: {user.profile.gender}<br />
    </div>
  </div>
);

export default withStyles(s)(Post);
