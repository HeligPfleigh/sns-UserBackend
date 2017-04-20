import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { Image } from 'react-bootstrap';
import s from './TimeLine.scss';

class TimeContent extends React.Component {

  static propTypes = {
    images: PropTypes.array.isRequired,
  };
  render() {
    return (

      <div className={s.layoutContent}>
        {this.props.images.map((image, i) => (
          
            <Image key={i} className={s.image} src={image} thumbnail />

              ))
          }


      </div>

    );
  }
}

export default withStyles(s)(TimeContent);
