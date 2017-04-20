
  import React, { PropTypes } from 'react';
  import { Button } from 'react-bootstrap';
  import withStyles from 'isomorphic-style-loader/lib/withStyles';
  import s from './Tab.scss';

  class Tab extends React.Component {

    static propTypes = {
      numbers: PropTypes.number.isRequired,
      onclicks: PropTypes.func.isRequired,
    };

    render() {
      return (

        <ul className={s.tab}>
          <li className={s.active}><Button onclick={this.props.onclicks(true)} bsClass={s.button}>Ảnh ({this.props.numbers}) <i className="fa fa-sort-asc" aria-hidden="false"></i></Button></li>
          <li><Button onclick={this.props.onclicks(false)} bsClass={s.button}>Thông tin <i className="fa fa-sort-asc"></i></Button></li>
        </ul>

      );
    }
}

  export default withStyles(s)(Tab);
