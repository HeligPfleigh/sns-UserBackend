import React, { PropTypes } from 'react';
import { FormControl, Button } from 'react-bootstrap';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './NewPost.css';

const NewPost = ({ value, handleChange, onSubmit }) => (
  <form>
    <FormControl
      type="text"
      label="Text"
      placeholder="Enter text"
      value={value}
      onChange={handleChange}
    />
    <Button onClick={onSubmit} >
            Submit
        </Button>
  </form>
);

NewPost.propTypes = {
  value: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default withStyles(s)(NewPost);
