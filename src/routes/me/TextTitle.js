import React, { PropTypes } from 'react';

import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Me.scss';

class TextTitle extends React.Component {

  static propTypes = {
    title: PropTypes.string.isRequired,
  };

  render() {
    return (

      <h4 className={s.textInline}>{this.props.title}</h4>

    );
  }
}

export default withStyles(s)(TextTitle);
