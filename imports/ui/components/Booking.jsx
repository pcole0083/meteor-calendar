import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment'; //for workiing with Date funcitonality
import { Meteor } from 'meteor/meteor';
import classnames from 'classnames';

// Booking component - represents a single todo item
export default class Booking extends Component {
  constructor(props) {
    super(props);
  }

  toggleChecked() {
    // Set the checked property to the opposite of its current value
    Meteor.call('bookings.setChecked', this.props.booking._id, !this.props.booking.checked);
  }
 
  deleteThisBooking() {
    this.closeEvent();
    Meteor.call('bookings.remove', this.props.booking._id);
  }

  togglePrivate() {
    Meteor.call('bookings.setPrivate', this.props.booking._id, ! this.props.booking.private);
  }

  closeEvent = (() => {
    this.props.closeModal(null);
  })

  render() {
  	// Give bookings a different className when they are checked off,
    // so that we can style them nicely in CSS
    const bookingClassName = classnames({
      checked: this.props.booking.checked,
      private: this.props.booking.private,
      hide: this.props.showKey !== this.props.booking._id,
    });

    const _id = 'key_'+this.props.booking._id;

    return (
      <li id={_id} className={bookingClassName}>
        <button type="button" className="close" data-dismiss={_id} aria-label="Close" onClick={this.closeEvent}>
          <span aria-hidden="true">&times;</span>
        </button>
        <input
          className="complete-check"
          type="checkbox"
          readOnly
          defaultChecked={this.props.booking.checked}
          onClick={this.toggleChecked.bind(this)}
        />
 
        <div className="text">
          <strong>Room #</strong>: {this.props.booking.room}
        </div>
        <div className="text">
          <strong>Name</strong>: {this.props.booking.name}
        </div>
        <div className="text">
          <strong>Purpose</strong>: {this.props.booking.purpose}
        </div>
        <div className="text">
          <strong>Booking Start/End</strong>: {moment(this.props.booking.start).format('llll')} / {moment(this.props.booking.end).format('llll')}
        </div>
        <div className="text">
          <button className="btn btn-danger delete" onClick={this.deleteThisBooking.bind(this)}>Delete</button>
          { this.props.showPrivateButton ? (
              <button className="btn btn-info toggle-private" onClick={this.togglePrivate.bind(this)}>
                { !this.props.booking.private ? 'Make Private' : 'Make Public' }
              </button>
          ) : ''}
        </div>
      </li>
    );
  }
}

Booking.propTypes = {
  // This component gets the booking to display through a React prop.
  // We can use propTypes to indicate it is required
  booking: PropTypes.object.isRequired,
  showPrivateButton: PropTypes.bool.isRequired
};