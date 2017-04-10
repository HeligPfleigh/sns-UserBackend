import React from 'react';
import Friends from './Friends';
import Layout from '../../components/Layout';

const title = 'Friends - SNS';

export default {

  path: '/friends',

  async action() {
    return {
      title,
      component: <Layout><Friends title={title} /></Layout>,
    };
  },

};
