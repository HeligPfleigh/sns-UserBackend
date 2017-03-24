/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import Home from './Home';
import Layout from '../../components/Layout';
import { selectUser } from '../../selectors';

export default {

  path: '/',

  async action(context) {
    const { store } = context;

    if (!selectUser(store)) {
      return { redirect: '/login' };
    }

    return {
      title: 'React Starter Kit',
      component: <Layout><Home /></Layout>,
    };
  },

};
