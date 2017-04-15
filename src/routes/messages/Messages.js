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
import { Grid, Row, Col } from 'react-bootstrap';
import ConversationList from '../../components/Chat/ConversationList';
import ConversationView from '../../components/Chat/ConversationView';
import s from './Messages.scss';

class Messages extends React.Component {

  render() {
    return (
      <Grid className={s.root}>
        <Row className={s.fullHeight}>
          <Col md={3} xs={12} className={s.fullHeight}>
            <Row className={s.fullHeight}>
              <ConversationList />
            </Row>
          </Col>
          <Col md={9} xs={12} className={s.fullHeight}>
            <Row className={s.fullHeight}>
              <ConversationView />
            </Row>
          </Col>
        </Row>
      </Grid>
    );
  }
}

export default withStyles(s)(Messages);
