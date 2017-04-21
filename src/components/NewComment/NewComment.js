import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

import Draft, {
  Editor,
  EditorState,
  CompositeDecorator,
  convertToRaw,
} from 'draft-js';

import {
  Image,
  Col,
  Clearfix,
} from 'react-bootstrap';

import s from './NewComment.css';
import HandleSpan from '../Commons/HandleSpan';
import HashtagSpan from '../Commons/HashtagSpan';

/**
       * Super simple decorators for handles and hashtags, for demonstration
       * purposes only. Don't reuse these regexes.
       */
const styles = {
  editor: {
    border: '1px solid #ddd',
    cursor: 'text',
    minHeight: 10,
    padding: 5,
    backgroundColor: '#fff',
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
    // initContent: PropTypes.string,
    commentId: PropTypes.string,
    isFocus: PropTypes.bool.isRequired,
    postId: PropTypes.string.isRequired,
    user: PropTypes.object.isRequired,
    createNewComment: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    // const { initContent } = this.props;
    this.state = {
      editorState: EditorState.createEmpty(compositeDecorator),
      isSubmit: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    const { isFocus } = this.props;
    // console.log(nextProps.isFocus);
    if (nextProps.isFocus !== isFocus) {
      this.editor.focus();
    }
  }

  onChange = (editorState) => {
    this.setState({
      editorState,
      isSubmit: editorState.getCurrentContent().hasText(),
    });
  }

  onSubmit = () => {
    const { postId, commentId } = this.props;
    const data = JSON.stringify(convertToRaw(this.state.editorState.getCurrentContent()));
    this.props.createNewComment(postId, data, commentId);

    // reset editor
    this.editor.blur();
    this.setState({
      editorState: EditorState.createEmpty(compositeDecorator),
      isSubmit: false,
    });
  }

  _keyBindingFn = (e) => {
    if (e.keyCode === 13 && !e.altKey) {
      return 'onSubmit';
    }
    return Draft.getDefaultKeyBinding(e);
  }

  _handleKeyCommand = (command) => {
    const { isSubmit } = this.state;
    if (command === 'onSubmit' && isSubmit) {
      this.onSubmit();
    }
    return 'not-handler';
  }

  focus = () => this.editor.focus();

  render() {
    const { editorState } = this.state;
    const { user } = this.props;
    return (
      <div className={s.newCommentPanel}>
        <Col className={`pull-left ${s.newCommentAvarta}`}>
          <a href="#">
            <Image src={user.profile.picture} circle />
          </a>
        </Col>
        <Col className={`pull-right ${s.newCommentEditor}`}>
          <div style={styles.editor} onClick={this.focus}>
            <Editor
              editorState={editorState}
              onChange={this.onChange}
              keyBindingFn={this._keyBindingFn}
              handleKeyCommand={this._handleKeyCommand}
              placeholder="Viết bình luận"
              ref={(editor) => { this.editor = editor; }}
              spellCheck
            />
          </div>
        </Col>
        <Clearfix />
      </div>
    );
  }
}

export default withStyles(s)(NewPost);
