
  import React, { PropTypes } from 'react';

  import withStyles from 'isomorphic-style-loader/lib/withStyles';
  import s from './Tab.scss';

  class Tab extends React.Component {

    static propTypes = {
      numbers: PropTypes.number.isRequired,
    };

    render() {
      return (

        <ul className={s.tab}>
          <li><a href="#">Ảnh ({this.props.numbers}) <i className="fa fa-sort-asc"></i></a></li>
          <li><a href="#">Thông tin <i className="fa fa-sort-asc"></i></a></li>
        </ul>

      );
    }
}

  export default withStyles(s)(Tab);
