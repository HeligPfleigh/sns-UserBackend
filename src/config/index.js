import * as development from './development';
import * as production from './production';

export default __DEV__ ? development : production; // eslint-disable-line
