import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import classnames from 'classnames';

// Booking component - represents a single todo item
export default class Booking extends Component {
  toggleChecked() {
    // Set the checked property to the opposite of its current value
    Meteor.call('bookings.setChecked', this.props.booking._id, !this.props.booking.checked);
  }
 
  deleteThisBooking() {
    Meteor.call('bookings.remove', this.props.booking._id);
  }

  togglePrivate() {
    Meteor.call('bookings.setPrivate', this.props.booking._id, ! this.props.booking.private);
  }

  render() {
  	// Give bookings a different className when they are checked off,
    // so that we can style them nicely in CSS
    const bookingClassName = classnames({
      checked: this.props.booking.checked,
      private: this.props.booking.private,
    });


    return (
      <li className={bookingClassName}>
        <button className="delete" onClick={this.deleteThisBooking.bind(this)}>
          &times;
        </button>
 
        <input
          className="complete-check"
          type="checkbox"
          readOnly
          defaultChecked={this.props.booking.checked}
          onClick={this.toggleChecked.bind(this)}
        />
 
        <div className="text">
          <strong>Name</strong>: {this.props.booking.name}
        </div>
        <div className="text">
          <strong>Purpose</strong>: {this.props.booking.purpose}
        </div>
        <div className="text">
          <strong>Booking Start/End</strong>: {this.props.booking.start} / {this.props.booking.end}
        </div>

        { this.props.showPrivateButton ? (
          <div className="text">
            <button className="toggle-private" onClick={this.togglePrivate.bind(this)}>
              { this.props.booking.private ? 'Hide' : 'Public' }
            </button>
          </div>
        ) : ''}
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