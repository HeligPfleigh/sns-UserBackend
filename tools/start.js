/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import WriteFilePlugin from 'write-file-webpack-plugin';
import runServer from './runServer';
import serverConfig from './webpack.config';

process.argv.push('--watch');

/**
 * Launches a development web server with "live reload" functionality -
 * synchronizing URLs, interactions and code changes across multiple devices.
 */
async function start() {
  await new Promise((resolve) => {
    // Save the server-side bundle files to the file system after compilation
    // https://github.com/webpack/webpack-dev-server/issues/62
    serverConfig.plugins.push(new WriteFilePlugin({ log: false }));

    const bundler = webpack(serverConfig);
    webpackDevMiddleware(bundler, {
    });
    let handleBundleComplete = async () => {
      handleBundleComplete = stats => !stats.compilation.errors.length && runServer();
      await runServer();
    };
    bundler.plugin('done', stats => handleBundleComplete(stats));
    resolve();
  });
}

export default start;
