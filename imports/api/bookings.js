import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

import moment from 'moment'; //for workiing with Date funcitonality

export const Bookings = new Mongo.Collection('bookings');

if (Meteor.isServer) {
  // This code only runs on the server
  // Only publish bookings that are public or belong to the current user
  Meteor.publish('bookings', function bookingsPublication() {
    return Bookings.find({
      $or: [
        { private: { $ne: true } }, //find all public events
        { owner: this.userId }, //find all events for this user
      ],
    });
  });
}

Meteor.methods({
  'bookings.insert'(room = 1, name, purpose, start, end) {
    check(name, String);
    check(purpose, String);
    check(start, Number);
    check(end, Number);

    // Make sure the user is logged in before inserting a booking
    if (! Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }

    //check to find at least one record with a start time during an existing
    //add check for end time during an existing
    let booking_collection = Bookings.find({
      $and: [
        { room:  { $eq:  room } }, //find all bookings for this room, can make this better by adding start and end checks here, but that query isn't working at the moment
      ], //sort by latest start time
    },{ sort: { start: -1 } }).fetch().filter(function(booking, index){
      if(start >= booking.start && start < booking.end){
        return booking;
      }
      if(booking.start >= end && booking.end <= end){ //why not >=? because people like to book meetings at 4:00pm-5:00pm & 5:00pm-6:00pm, not 4:00px-5:00-pm & 5:01pm-6:01pm.
        return booking;
      }
    });

    // console.log(start);
    // console.log(booking_collection);

    if( booking_collection.length > 0 ) {
      //let the user know the booking time that is blocking their meeting.
      throw new Meteor.Error('Booking already exists for that room during for '+moment(booking_collection[0].start).format('llll')+' to '+ moment(booking_collection[0].end).format('llll'));
    }

    if(!purpose){
      purpose = 'N/A';
    }

    Bookings.insert({
      room: room,
      name: name,
      purpose: purpose,
      createdAt: new Date(), //created at date record, not to be mistake for start and end
      start: start,
      end: end,
      owner: Meteor.userId(),
      username: Meteor.user().username,
      private: false, //make the booking public by default
    });
  },
  'bookings.remove'(bookingId) {
  	check(bookingId, String);
  	
    const booking = Bookings.findOne(bookingId);
    if (booking.owner !== Meteor.userId()) {
      //make sure only the owner can delete it
      throw new Meteor.Error('not-authorized');
    }

    Bookings.remove(bookingId);
  },
  'bookings.setChecked'(bookingId, setChecked) {
    check(bookingId, String);
    check(setChecked, Boolean);

    const booking = Bookings.findOne(bookingId);
    if (booking.owner !== Meteor.userId()) {
      //make sure only the owner can check it off as completed
      throw new Meteor.Error('not-authorized');
    }

    Bookings.update(bookingId, { $set: { checked: setChecked } });
  },
  'bookings.setPrivate'(bookingId, setToPrivate) {
    check(bookingId, String);
    check(setToPrivate, Boolean);
 
    const booking = Bookings.findOne(bookingId);
 
    // Make sure only the booking owner can make a booking private
    if (booking.owner !== Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }
 
    Bookings.update(bookingId, { $set: { private: setToPrivate } });
  },
});
