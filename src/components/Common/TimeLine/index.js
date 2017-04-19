import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import TimeContent from './TimeContent';
import TimeEvent from './TimeEvent';
import s from './TimeLine.scss';

class TimeLine extends React.Component {
  render() {
    return (
      <div >
        <div className={s.line}>
          <div>
            <TimeEvent />
            <TimeContent />
          </div>

        </div>
      </div>
    );
  }
}

export default withStyles(s)(TimeLine);
