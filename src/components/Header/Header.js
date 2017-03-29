/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import MediaQuery from 'react-responsive';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Header.css';
import Link from '../Link';
import Navigation from '../Navigation';
import NavRight from '../NavRight';
import SearchBox from '../SearchBox';
// import logoUrl from './logo-small.png';
// import logoUrl2x from './logo-small@2x.png';

class Header extends React.Component {
  render() {
    return (
      <span>
        <MediaQuery query="(min-device-width: 768px)">
          <div className={`navbar-fixed-top ${s.root}`}>
            <div className={s.container}>
              <Link className={s.brand} to="/">
                <div className={`hidden-lg hidden-md col-sm-1 col-xs-1 ${s.leftFix}`}></div>
                <span className={` btn btn-danger ${s.brandTxt}`}>SNS</span>
              </Link>
              <SearchBox isMobile={false} />
              <NavRight />
              <Navigation isMobile={false} />
            </div>
          </div>
        </MediaQuery>
        <MediaQuery query="(max-device-width: 768px)">
          <div className={`navbar-fixed-top ${s.navRoot}`}>
            <div className={s.navMobile}>
              <Link className={s.brandMobile} to="/">
                <span className={`btn btn-danger ${s.brandTxt}`}>SNS</span>
              </Link>
              <SearchBox isMobile={!false} />
              <NavRight />
            </div>
            <div className={`${s.navMobile} ${s.navControl}`}>
              <Navigation isMobile={!false} />
            </div>
          </div>
        </MediaQuery>
      </span>
    );
  }
}

export default withStyles(s)(Header);
