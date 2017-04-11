import React from 'react';
import { Editor, EditorState } from 'draft-js';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './ChatEditor.css';

class ChatEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = { editorState: EditorState.createEmpty() };
    this.onChange = editorState => this.setState({ editorState });
  }
  render() {
    return (
      <Editor editorState={this.state.editorState} onChange={this.onChange} ref={(editor) => { this.editor = editor; }} spellCheck />
    );
  }
}
export default withStyles(s)(ChatEditor);
