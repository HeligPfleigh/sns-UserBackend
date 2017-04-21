import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { connect } from 'react-redux';
import Loading from '../../components/Loading';
import FriendList from '../../components/Friend/FriendList';
import { ACCEPTED } from '../../constants';
import s from './Conversation.scss';
import { addNewUserToConversation } from '../../actions/chat';

const friendsPageQuery = gql`query friendsPageQuery {
  me {
    _id,
    username,
    profile {
      picture,
      firstName,
      lastName
    }
    friends {
      _id
      profile {
        picture,
        firstName,
        lastName
      }
      chatId
    }
  }
}
`;

@graphql(friendsPageQuery)
@connect(
  null,
  { addNewUserToConversation })
class NewMessage extends React.Component {
  static propTypes = {
    data: PropTypes.shape({
      loading: PropTypes.bool.isRequired,
    }).isRequired,
    addNewUserToConversation: PropTypes.func.isRequired,
  };
  constructor() {
    super();
    this.state = {
      searchText: null,
    };
  }
  componentDidMount() {
    this.input.focus();
  }
  handleChangeSearch = (e) => {
    this.setState({
      searchText: e.target.value,
    });
  }
  handleFriendAction = (friend) => {
    this.props.addNewUserToConversation(friend);
  }
  render() {
    const { data: { loading, me } } = this.props;
    const { searchText } = this.state;
    return (
      <div className={s.toNewMess}>
        <div className={s.searchBox}>
          <label htmlFor="searchToMess">To:</label>
          <input id="searchToMess" ref={(node) => { this.input = node; }} onChange={this.handleChangeSearch} placeholder="Type a name of friend..." />
        </div>
        {
          searchText &&
          <div className={`${s.listPeopleBox} col-md-4 col-xs-12`}>
            <Loading show={loading} />
            {
              me && me.friends &&
              <FriendList className={s.listPeople} friends={me.friends} friendType={ACCEPTED} handleFriendAction={this.handleFriendAction} />
            }
          </div>
        }
      </div>
    );
  }
}

export default withStyles(s)(NewMessage);
