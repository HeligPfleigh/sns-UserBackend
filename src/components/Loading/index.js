import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Loading.scss';

class Loading extends Component {
  static propTypes = {
    className: PropTypes.string,
    show: PropTypes.bool,
    full: PropTypes.bool,
    children: PropTypes.node,
  }

  render() {
    const { className, show, children, full } = this.props;
    const classStyle = classNames(s.loading, className, { hidden: !show, [s.fixed]: full });
    return (
      <div className={classStyle}>
        <svg className="spinner" width="65px" height="65px" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
          <circle className="path" fill="none" strokeWidth="6" strokeLinecap="round" cx="33" cy="33" r="30" />
        </svg>
        {
          children
        }
      </div>
    );
  }
}

export default withStyles(s)(Loading);
