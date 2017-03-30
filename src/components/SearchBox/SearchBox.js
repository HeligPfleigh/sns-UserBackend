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
import s from './SearchBox.css';

class SearchBox extends React.Component {
  static defaultProps = {
    isMobile: false,
  }

  static propTypes = {
    isMobile: React.PropTypes.bool.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      showForm: false,
      isMobile: this.props.isMobile,
    };
  }

  onClick = () => {
    this.setState({ showForm: true });
  }

  onBlur = () => {
    const { value } = this.nameInput;
    if (value === '') {
      this.setState({ showForm: false });
    }
  }

  render() {
    const { isMobile, showForm } = this.state;

    if (!isMobile || showForm === true) {
      return (
        <div className={s.root} onBlur={this.onBlur}>
          <form className={s.formSearch}>
            <input
              autoFocus
              type="text"
              className={`form-control ${s.searchQuery}`}
              placeholder="Search..."
              ref={(input) => { this.nameInput = input; }}
            />
          </form>
        </div>
      );
    }

    return (
      <div className={s.mSearchRoot}>
        {
          //eslint-disable-next-line
        }<span onClick={this.onClick}>
          <i className="fa fa-search fa-lg" aria-hidden="true"></i>
        </span>
      </div>
    );
  }
}

export default withStyles(s)(SearchBox);
