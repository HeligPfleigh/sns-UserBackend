import moment from 'moment';

export default (time) => {
  const now = moment(time);
  const date = moment(time);
  if (now.get('day') === date.get('day')) {
    return date.format('hh:mm a');
  }
  if (now.get('year') === date.get('year')) {
    return date.format('dd-MM');
  }
  return date.format('dd-MM-YYYY');
};
