import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import moment from 'moment'; //for workiing with Date funcitonality

import BigCalendar from 'react-big-calendar';
BigCalendar.momentLocalizer(moment); // or globalizeLocalizer

// Booking component - represents a single todo item
export default class Calendar extends Component {
	constructor(props) {
    	super(props);
	}

	showEvent = ((event) => {
		this.props.showModal(event.key);
	})

	render() {
		let scope = this;
	    let filteredBookings = this.props.bookings;
	    if (this.props.hideCompleted) {
	      filteredBookings = filteredBookings.filter(booking => !booking.checked);
	    }

	    let events = filteredBookings.map((booking) => {
	      const currentUserId = this.props.currentUser && this.props.currentUser._id;
	      const showPrivateButton = booking.owner === currentUserId;
	 
	      return {
	        'title': 'Room  #'+booking.room+': '+booking.name,
	        'start': new Date(booking.start),
	        'end': new Date(booking.end),
	        'desc': booking.purpose,
	        'key': booking._id
	      };
	    });

	    return (
	      <div>
	        <BigCalendar
	          events={events}
	          startAccessor='start'
	          endAccessor='end'
	          defaultView='day'
	          views={['day', 'week']}
	          onSelectEvent={scope.showEvent}
	        />
	      </div>
	    );
	    //startAccessor tells big calendar what property of the events to use as the start datetime (required)
	    //endAccessor tells big calendar what property of the events to use as the end datetime (required)
  	}
}

Calendar.propTypes = {
  bookings: PropTypes.array.isRequired,
  currentUser: PropTypes.object,
};
