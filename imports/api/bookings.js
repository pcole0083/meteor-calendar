import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

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

    // Make sure the user is logged in before inserting a booking
    if (! Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }

    //this is very much overly simplistic
    //the dates should be saved in milliseconds and then existing can check $gte, $lte, etc.
    let existing = Bookings.findOne({
      $and: [
        { room: room },
        { start: { start } },
        { end:   { end } },
      ]
    });

    if( existing ) {
      throw new Meteor.Error('Booking already exists for that room during that time.');
    }

    Bookings.insert({
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
