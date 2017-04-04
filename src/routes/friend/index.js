import React from 'react';
import Layout from '../../components/Layout';

export default {
  path: '/friend',
  async action() {
    return {
      title: 'Friend',
      component: <Layout />,
    };
  },
};
