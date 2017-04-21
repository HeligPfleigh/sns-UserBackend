import React from 'react';
import Messages from './Messages';
import Layout from '../../components/Layout';

const title = 'Messages - SNS';

export default {

  path: '/messages',

  async action() {
    return {
      title,
      component: <Layout><Messages /></Layout>,
    };
  },

};
