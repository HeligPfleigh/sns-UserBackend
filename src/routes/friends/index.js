import React from 'react';
import Friends from './Friends';
import Layout from '../../components/Layout';
import { selectUser } from '../../selectors';

const title = 'Friends - React Starter Kit';

export default {

  path: '/friends',

  async action(context) {
    const { store } = context;

    if (!selectUser(store)) {
      return { redirect: '/login' };
    }

    return {
      component: <Layout><Friends title={title} /></Layout>,
    };
  },

};
