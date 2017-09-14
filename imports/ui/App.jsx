import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';

import moment from 'moment'; //for workiing with Date funcitonality
import InputMoment from 'input-moment'; //date picker

import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import { Bookings } from '../api/bookings.js'; //bookings data

import Booking from './components/Booking.jsx'; //bookings view
import AccountsUIWrapper from './AccountsUIWrapper.jsx'; //acounts ui view

// App component - represents the whole app
class App extends Component {
  constructor(props) {
    super(props);
 
    this.state = {
      hideCompleted: false,
      m: moment(),
      end: moment().add(1, 'hours')
    };
  }

  handleChange = m => {
    this.setState({ m, end });
  };

  handleSubmit(event) {
    event.preventDefault();
 
    // Find the text fields via the React ref
    let uname = ReactDOM.findDOMNode(this.refs.textInput).value.trim();
    let reason = ReactDOM.findDOMNode(this.refs.purposeInput).value.trim();

    let start = this.state.m.format('llll'); //save in a readable format so we dn't have to parse later
    let end = this.state.m.add(1, 'hours').format('llll'); //save in a readable format so we dn't have to parse later
    /**
     * To extend this to have a variable end time, change the end state reference to pull seperately from the UI.
     * handleEndChange = end => {...}
     */

    Meteor.call('bookings.insert', uname, reason, start, end); //insert new record
    // Clear purpose form field but not name in case they want to book another
    ReactDOM.findDOMNode(this.refs.purposeInput).value = '';
  }

  toggleHideCompleted() {
    this.setState({
      hideCompleted: !this.state.hideCompleted,
    });
  }

  renderBookings() {
    let filteredBookings = this.props.bookings;
    if (this.state.hideCompleted) {
      filteredBookings = filteredBookings.filter(booking => !booking.checked);
    }

    return filteredBookings.map((booking) => {
      const currentUserId = this.props.currentUser && this.props.currentUser._id;
      const showPrivateButton = booking.owner === currentUserId;
 
      return (
        <Booking
          key={booking._id}
          booking={booking}
          showPrivateButton={showPrivateButton}
        />
      );
    });
  }

  render() {
    return (
      <div className="container">
        <header>
          <h1>Book Your Appointment ({this.props.incompleteCount})</h1>

          <label className="hide-completed">
            <input
              type="checkbox"
              readOnly
              checked={this.state.hideCompleted}
              onClick={this.toggleHideCompleted.bind(this)}
            />
            Hide Completed Bookings
          </label>

          <AccountsUIWrapper />

          { this.props.currentUser ?
            <form className="new-booking" onSubmit={this.handleSubmit.bind(this)} >
              <div className="input-wrapper">
                <button className="btn" onClick={this.handleSubmit.bind(this)}>Add Booking</button>
              </div>
              <div className="input-wrapper">
                <input
                  type="text"
                  ref="textInput"
                  placeholder="Name for Booking"
                  defaultValue={this.props.currentUser.username}
                />
              </div>
              <div className="input-wrapper">
                <input
                  type="text"
                  ref="purposeInput"
                  placeholder="Purpose for booking"
                />
              </div>
              <div className="input-wrapper">
                <input type="text" ref="dateInput" value={this.state.m.format('llll')} readOnly />
              </div>
              <InputMoment
                moment={this.state.m}
                onChange={this.handleChange}
              />
              <div className="input-wrapper">
                <button className="btn" onClick={this.handleSubmit.bind(this)}>Add Booking</button>
              </div>
            </form> : ''
          }
        </header>

        <ul>
          {this.renderBookings()}
        </ul>
      </div>
    );
  }
}

App.propTypes = {
  bookings: PropTypes.array.isRequired,
  incompleteCount: PropTypes.number.isRequired,
  currentUser: PropTypes.object,
};

export default createContainer(() => {
  Meteor.subscribe('bookings');

  return {
    bookings: Bookings.find({}, { sort: { createdAt: -1 } }).fetch(),
    incompleteCount: Bookings.find({ checked: { $ne: true } }).count(),
    currentUser: Meteor.user(),
  };
}, App);
