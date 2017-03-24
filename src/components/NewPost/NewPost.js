import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './NewPost.css';
import { FormControl, Button } from 'react-bootstrap'

const NewPost = () => (
    <form>
        <FormControl
        type="text"
        label="Text"
        placeholder="Enter text"
        />
        <Button>
            Submit
        </Button>
    </form>
);

export default withStyles(s)(NewPost);
