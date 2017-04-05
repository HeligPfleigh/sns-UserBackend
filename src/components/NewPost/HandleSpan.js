/** HandleSpan Componet */
import React from 'react';

const styles = {
  handle: {
    color: 'rgba(98, 177, 254, 1.0)',
    direction: 'ltr',
    unicodeBidi: 'bidi-override',
  },
};

const HandleSpan = (props) => {
  const result = (
    <span style={styles.handle} data-offset-key={props.offsetKey}>
      {props.children}
    </span>
  );
  return result;
};

HandleSpan.defaultProps = {
  offsetKey: null,
  children: null,
};

HandleSpan.propTypes = {
  offsetKey: React.PropTypes.string,
  children: React.PropTypes.arrayOf(React.PropTypes.any),
};

export default HandleSpan;
