/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import Login from './Login';
import { selectUser } from '../../selectors';

const title = 'Log In';

export default {

  path: '/login',

  action(context) {
    const { store } = context;

    if (selectUser(store)) {
      return { redirect: '/' };
    }

    return {
      title,
      component: <Login title={title} />,
    };
  },

};
