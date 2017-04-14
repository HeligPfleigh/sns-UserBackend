import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

import {
  Editor,
  EditorState,
  CompositeDecorator,
  convertToRaw,
} from 'draft-js';

import {
  Col,
  Clearfix,
  Button,
} from 'react-bootstrap';

import s from './NewPost.css';
import HandleSpan from './HandleSpan';
import HashtagSpan from './HashtagSpan';

/**
       * Super simple decorators for handles and hashtags, for demonstration
       * purposes only. Don't reuse these regexes.
       */
const styles = {
  editor: {
    border: '1px solid #ddd',
    cursor: 'text',
    minHeight: 40,
    padding: 10,
  },
};

const HANDLE_REGEX = /@[\w\d]+/g;
const HASHTAG_REGEX = /#[\w\d]+/g;

const findWithRegex = (regex, contentBlock, callback) => {
  const text = contentBlock.getText();
  let start;
  let matchArr = regex.exec(text);
  while (matchArr !== null) {
    start = matchArr.index;
    callback(start, start + matchArr[0].length);
    matchArr = regex.exec(text);
  }
};

const handleStrategy = (contentBlock, callback) => {
  findWithRegex(HANDLE_REGEX, contentBlock, callback);
};

const hashtagStrategy = (contentBlock, callback) => {
  findWithRegex(HASHTAG_REGEX, contentBlock, callback);
};

const compositeDecorator = new CompositeDecorator([{
  strategy: handleStrategy,
  component: HandleSpan,
},
{
  strategy: hashtagStrategy,
  component: HashtagSpan,
}]);

/** NewPost Component */
class NewPost extends React.Component {
  static propTypes = {
    createNewPost: PropTypes.func.isRequired,
  };

  constructor() {
    super();

    this.state = {
      editorState: EditorState.createEmpty(compositeDecorator),
      isSubmit: true,
    };
  }

  onChange = (editorState) => {
    this.setState({
      editorState,
      isSubmit: !editorState.getCurrentContent().hasText(),
    });
  }

  onSubmit = () => {
    const data = JSON.stringify(convertToRaw(this.state.editorState.getCurrentContent()));
    this.props.createNewPost(data);
    this.setState({
      editorState: EditorState.createEmpty(compositeDecorator),
      isSubmit: true,
    });
  }

  focus = () => this.editor.focus();

  render() {
    const { editorState, isSubmit } = this.state;
    return (
      <div className={s.newPostPanel}>
        <Col className={s.newPostEditor}>
          <div style={styles.editor} onClick={this.focus}>
            <Editor
              editorState={editorState}
              onChange={this.onChange}
              placeholder="Chia sẻ bài viết, ảnh hoặc cập nhật"
              ref={(editor) => { this.editor = editor; }}
              spellCheck
            />
          </div>
        </Col>
        <Col className={s.newPostControl}>
          <Col className="pull-left">
            <Button bsStyle="link" className={s.addPhoto}>
              <i className="fa fa-camera fa-lg" aria-hidden="true"></i>&nbsp;
              <span>Photo</span>
            </Button>
          </Col>

          <Col className="pull-right">
            <Button bsStyle="primary" onClick={this.onSubmit} disabled={isSubmit}>Đăng bài</Button>
          </Col>
          <Clearfix />
        </Col>
      </div>
    );
  }
}

export default withStyles(s)(NewPost);
