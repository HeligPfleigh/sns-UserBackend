/** HashtagSpan Component */
import React from 'react';

const styles = {
  hashtag: {
    color: 'rgba(95, 184, 138, 1.0)',
  },
};

const HashtagSpan = (props) => {
  const result = (
    <span style={styles.hashtag} data-offset-key={props.offsetKey}>
      {props.children}
    </span>
  );
  return result;
};

HashtagSpan.defaultProps = {
  offsetKey: null,
  children: null,
};

HashtagSpan.propTypes = {
  offsetKey: React.PropTypes.string,
  children: React.PropTypes.arrayOf(React.PropTypes.any),
};

export default HashtagSpan;
