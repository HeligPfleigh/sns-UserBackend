import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Eventtime.scss';
import { Timeline, TimelineEvent } from 'react-event-timeline';


class Eventtime extends React.Component {

  static propTypes = {
    createdAt: PropTypes.string.isRequired,
    element: PropTypes.element.isRequired,
  };

  render() {
    const styles = {
      width: '98%',
      backgroundColor: 'transparent',
      boxShadow: 'none',
    };
    return (

      <Timeline>
          <TimelineEvent

            createdAt={this.props.createdAt}
            iconColor="black"
            contentStyle={styles}
          >
            {this.props.element}
          </TimelineEvent>

        </Timeline>

    );
  }
}
export default withStyles(s)(Eventtime);

