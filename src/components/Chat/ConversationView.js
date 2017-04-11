import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Conversation.scss';
import ChatEditor from './ChatEditor';

class ConversationView extends React.Component {
  static propTypes = {
    title: PropTypes.string,
  };

  render() {
    return (
      <div className={s.viewChat}>
        <div className={s.messagesList}>
          Haha
        </div>
        <div className={s.editor}>
          <ChatEditor />
        </div>
      </div>
    );
  }
}

export default withStyles(s)(ConversationView);
