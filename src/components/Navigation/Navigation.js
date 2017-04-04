/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Navigation.css';
import Link from '../Link';

class Navigation extends React.Component {
  static defaultProps = {
    isMobile: false,
  }

  static propTypes = {
    isMobile: React.PropTypes.bool.isRequired,
  }

  render() {
    const { isMobile } = this.props;
    return (
      <div className={isMobile === false ? s.root : s.navbarSecond} role="navigation">
        <Link className={isMobile === false ? s.link : s.navLink} to="/admin">
          <i className="fa fa-home fa-lg"></i>
          {isMobile === false ? <span>Trang chủ</span> : ''}
        </Link>

        <Link className={isMobile === false ? s.link : s.navLink} to="/friends">
          <i className="fa fa-users fa-lg"></i>
          {isMobile === false ? <span>Nhóm</span> : ''}
        </Link>

        <Link className={isMobile === false ? s.link : s.navLink} to="/admin">
          <i className="fa fa-comments fa-lg"></i>
          {isMobile === false ? <span>Tinh nhắn</span> : ''}
        </Link>

        <Link className={isMobile === false ? s.link : s.navLink} to="/contact">
          <i className="fa fa-bell fa-lg"></i>
          {isMobile === false ? <span>Thông báo</span> : ''}
        </Link>
      </div>
    );
  }
}

export default withStyles(s)(Navigation);
