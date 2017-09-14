/* eslint-env mocha */
 
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { assert } from 'meteor/practicalmeteor:chai';

import { Bookings } from './bookings.js';

if (Meteor.isServer) {
  describe('Bookings', () => {
    describe('methods', () => {
    	const userId = Random.id();
      let bookingId;
 
      beforeEach(() => {
        Bookings.remove({});
        bookingId = Bookings.insert({
          text: 'test booking',
          createdAt: new Date(),
          owner: userId,
          username: 'tmeasday',
        });
      });

      it('can delete owned booking', () => {
      	// Find the internal implementation of the booking method so we can
        // test it in isolation
        const deleteBooking = Meteor.server.method_handlers['bookings.remove'];
 
        // Set up a fake method invocation that looks like what the method expects
        const invocation = { userId };
 
        // Run the method with `this` set to the fake invocation
        deleteBooking.apply(invocation, [bookingId]);
 
        // Verify that the method does what we expected
        assert.equal(Bookings.find().count(), 0);
      });
    });
  });
}