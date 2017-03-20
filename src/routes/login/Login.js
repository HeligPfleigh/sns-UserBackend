/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Login.css';

class Login extends React.Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
  };

  render() {
    return (
      <div className="container text-center">
        <div className={`row ${s.div_blank}`}>
          &nbsp;
        </div>
        <div className={`row hidden-xs ${s.div_blank_2}`}></div>
        <div className="row">
          <div className="col-sm-8 col-sm-offset-2 text">
            <h1>.: SNS :.</h1>
          </div>
        </div>

        <div className="row">
          {/**
           * <div className="col-sm-5 col-sm-offset-2"></div>
           */}
          {/**
          <div className="col-sm-5">
              <div className={s.form_box}>
                <div className={s.form_top}>
                  <div className={s.form_top_left}>
                    <h3>Login to our site</h3>
                    <p>Enter username and password to log on:</p>
                  </div>
                  <div className={s.form_top_right}>
                    <i className="fa fa-key"></i>
                  </div>
                </div>

                <div className={s.form_bottom}>
                  <form role="form" action="" method="post">
                    <div className="form-group">
                      <label className="sr-only" htmlFor="form_username">Username</label>
                      <input type="text" name="form_username" placeholder="Username..."
                        className="form_username form-control" id="form_username" />
                    </div>
                    <div className="form-group">
                      <label className="sr-only" htmlFor="form_password">Password</label>
                      <input type="password" name="form_password" placeholder="Password..."
                        className="form_password form-control" id="form_password" />
                    </div>
                    <button type="submit" className={`btn ${s.btn_signin}`}>Sign in!</button>
                  </form>
                </div>
              </div>
            */}

          <div className={s.social_login}>
            <h3 className="hidden">...or login with:</h3>
            <div className={s.social_login_buttons}>
              <a className={`btn ${s.btn_link_login} ${s.btn_link_login_facebook}`} href="#">
                <i className="fa fa-facebook"></i> Login Facebook
              </a>
              {/**
              <a className={`btn ${s.btn_link_login} ${s.btn_link_login_twitter}`} href="#">
                <i className="fa fa-twitter"></i> Twitter
              </a>
              <a className={`btn ${s.btn_link_login} ${s.btn_link_login_google_plus}`} href="#">
                <i className="fa fa-google-plus"></i> Google Plus
              </a>
                */}
            </div>
          </div>
          {/** </div> */}
        </div>
      </div>
    );
  }
}

export default withStyles(s)(Login);
