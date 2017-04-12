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
import { Grid, Row, Col, Button } from 'react-bootstrap';
import MediaQuery from 'react-responsive';

import s from './Header.css';
import SearchBox from '../SearchBox';
import Navigation from '../Navigation';
import NavRight from '../NavRight';
import history from '../../core/history';
// import logoUrl from './logo-small.png';
// import logoUrl2x from './logo-small@2x.png';

class Header extends React.Component {

  gotoHomePage =() => {
    history.push('/');
  }
  render() {
    return (
      <Grid bsClass="navbar" className={s.root}>
        <Row className={s.container}>
          <Col lg={6} md={6} sm={7} xs={7} className={s.nowrap}>
            <Button onClick={this.gotoHomePage} bsStyle="danger" className={s.brand}>HX</Button>
            <MediaQuery query="(min-width: 992px)">
              <SearchBox />
            </MediaQuery>
            <MediaQuery query="(max-width: 992px)">
              <SearchBox isMobile />
            </MediaQuery>
          </Col>
          <MediaQuery query="(min-width: 992px)">
            <Col lg={4} md={4} className={s.navControl}>
              <Navigation />
            </Col>
          </MediaQuery>
          <Col lg={2} md={2} sm={5} xs={5} className={s.navRightWrap}>
            <NavRight />
          </Col>
        </Row>
        <MediaQuery query="(max-width: 992px)">
          <Row className={`${s.container} ${s.navControl}`}>
            <Navigation isMobile />
          </Row>
        </MediaQuery>
      </Grid>
    );
  }
}

export default withStyles(s)(Header);
