import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';

import moment from 'moment'; //for workiing with Date funcitonality
import InputMoment from 'input-moment'; //date picker

import BigCalendar from 'react-big-calendar';
BigCalendar.momentLocalizer(moment); // or globalizeLocalizer

import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import { Bookings } from '../api/bookings.js'; //bookings data

import Booking from './components/Booking.jsx'; //bookings view
import Calendar from './components/Calendar.jsx'; //bookings view
import AccountsUIWrapper from './AccountsUIWrapper.jsx'; //acounts ui view

// App component - represents the whole app
class App extends Component {
  constructor(props) {
    super(props);
 
    this.state = {
      hideCompleted: false,
      m: moment(),
      modalOpen: false,
      modalKey: null
    };
  }

  componentWillReceiveProps(nextProps) {

  }

  handleChange = m => {
    this.setState({ m });
  };

  handleSubmit(event) {
    event.preventDefault();
 
    // Find the text fields via the React ref
    let room = ~~ReactDOM.findDOMNode(this.refs.roomInput).value.trim(); //convert to ~~int
    let uname = ReactDOM.findDOMNode(this.refs.textInput).value.trim();
    let reason = ReactDOM.findDOMNode(this.refs.purposeInput).value.trim();

    let start = this.state.m.valueOf(); //save in a readable format so we dn't have to parse later
    let end = moment(this.state.m).add(1, 'hours').valueOf(); //save in a readable format so we dn't have to parse later
    /**
     * To extend this to have a variable end time, change the end state reference to pull seperately from the UI.
     * handleEndChange = end => {...}
     */

    //insert new record
    Meteor.call('bookings.insert', Number(room), uname, reason, start, end, function(error, result) {
      if(!!error){
        alert(error.error);
      }
    });
    // Clear purpose form field but not name in case they want to book another
    ReactDOM.findDOMNode(this.refs.purposeInput).value = '';
  }

  showModal = ((key) => {
    this.setState({ modalOpen: !!key, modalKey: key});
  })

  toggleHideCompleted() {
    this.setState({
      hideCompleted: !this.state.hideCompleted,
    });
  }

  //render the list view
  //could be moved to seperate component
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
          show={this.state.modalOpen}
          showKey={this.state.modalKey}
          closeModal={this.showModal}
        />
      );
    });
  }

  //render the calendar view
  //could be moved to seperate component
  renderCalendar() {
    return (
        <Calendar
          bookings={this.props.bookings}
          currentUser={this.props.currentUser}
          showModal={this.showModal}
        />
    );
    //startAccessor tells big calendar what property of the events to use as the start datetime (required)
    //endAccessor tells big calendar what property of the events to use as the end datetime (required)
  }

  //app render
  render() {
    let modalClassName = 'modal fade';
    if(!!this.state.modalOpen){
      modalClassName += ' in';
    }

    return (
      <div className="container">
        <header>
          <h1>Book Your Meeting</h1>

          <AccountsUIWrapper />

          { this.props.currentUser ?
            <form className="new-booking" onSubmit={this.handleSubmit.bind(this)} >
              <div className="input-wrapper">
                <button className="btn btn-default" onClick={this.handleSubmit.bind(this)}>Add Booking</button>
              </div>
              <div className="input-wrapper">
                <label><strong>Room #</strong></label>
                <input
                  type="text"
                  ref="roomInput"
                  placeholder="Room Number 1, 2, 3"
                  defaultValue="1"
                />
              </div>
              <div className="input-wrapper">
                <label><strong>Name</strong></label>
                <input
                  type="text"
                  ref="textInput"
                  placeholder="Name for Booking"
                  defaultValue={this.props.currentUser.username}
                />
              </div>
              <div className="input-wrapper">
                <label><strong>Purpose</strong></label>
                <input
                  type="text"
                  ref="purposeInput"
                  placeholder="Purpose for booking"
                />
              </div>
              <div className="input-wrapper">
                <label><strong>Datetime</strong></label>
                <input type="text" ref="dateInput" value={this.state.m.format('llll')} readOnly />
              </div>
              <InputMoment
                moment={this.state.m}
                onChange={this.handleChange}
              />
              <div className="input-wrapper">
                <button className="btn btn-default" onClick={this.handleSubmit.bind(this)}>Add Booking</button>
              </div>
            </form> : ''
          }
        </header>

        <section>
          <h2>Confernce Rooms Calendar</h2>
          {this.renderCalendar()}
        </section>
        <section ref="bookingsList" className={modalClassName} tabIndex="-1" role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
            <ul>
              {this.renderBookings()}
            </ul>
            </div>
          </div>
        </section>
      </div>
    );
  }
}

App.propTypes = {
  bookings: PropTypes.array.isRequired,
  currentUser: PropTypes.object,
};

export default createContainer(() => {
  Meteor.subscribe('bookings');

  return {
    bookings: Bookings.find({}, { sort: { createdAt: -1 } }).fetch(),
    currentUser: Meteor.user(),
  };
}, App);
