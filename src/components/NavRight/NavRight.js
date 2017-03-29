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
import s from './NavRight.css';

const NavRight = () => (
  <span>
    <span className={s.menuRight}>
      <i className="fa fa-bars fa-2x" aria-hidden="true"></i>
    </span>
    <span className={s.navRight}>
      <i className="fa fa-user-circle fa-2x" aria-hidden="true"></i>
    </span>
  </span>
);

export default withStyles(s)(NavRight);
