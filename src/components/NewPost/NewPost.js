import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './NewPost.css';
import { FormControl, Button } from 'react-bootstrap'

const NewPost = ({handleChange, onSubmit}) => (
    <form>
        <FormControl
        type="text"
        label="Text"
        placeholder="Enter text"
        onChange={handleChange}
        />
        <Button onClick={onSubmit} >
            Submit
        </Button>
    </form>
);

export default withStyles(s)(NewPost);
