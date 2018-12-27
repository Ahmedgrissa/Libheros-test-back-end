var roomModel = require('../models/roomModel.js');
var fs = require('fs');
const file = './bookings.json';
var _ = require('lodash');
/**
 * roomController.js
 *
 * @description :: Server-side logic for managing rooms.
 */
module.exports = {

    /**
     * roomController.list()
     */
    list: function (req, res) {

        roomModel.find(function (err, rooms) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting room.',
                    error: err
                });
            }
            var availableRooms = [];
            var filters = JSON.parse(req.query.filters);
            var date = filters.bookingDateAndTime.date;
            // WE ARE Converting Time: hour:min To a number hour.min to compare easily between times..
            var requestedStartingTime = filters.bookingDateAndTime.startingTime.hour + filters.bookingDateAndTime.startingTime.minute / 100;
            var requestedEndingTime = filters.bookingDateAndTime.endingTime.hour + filters.bookingDateAndTime.endingTime.minute / 100;

            rooms.forEach(room => {
                var numberOfEquipementsInCommun = _.intersectionBy(room.equipements, filters.equipements, 'name').length
                if ((filters.equipements.length && numberOfEquipementsInCommun) || !filters.equipements.length) {
                    if (room.capacity >= filters.capacity) {
                        if (!room.bookings.length) {
                            //IF THE ROOM DOESN'T HAVE ANY BOOKINGS WE ADD IT TO AVAILABLE ROOMS.
                            availableRooms.push(room);
                        } else {
                            // WE EXTRACT A TABLE OF BOOKINGS' DATES
                            var bookingsDates = room.bookings.map(
                                booking => {
                                    return booking.date
                                }
                            );
                            var indexOfRequestedDate = bookingsDates.indexOf(date);
                            // IF THERE'S NO BOOKING IN THE REQUESTED DATE THEN IT'S AVAILABLE
                            if (indexOfRequestedDate === -1) {
                                availableRooms.push(room);
                            } else {
                                // WE EXTRACT ONLY THE BOOKINGS OF THAT REQUESTED DATE TO CHECK IF THE REQUESTED TIME IS AVAILABLE
                                var requestedDateBookings = room.bookings.filter(
                                    booking => {
                                        return booking.date === date
                                    });
                                var checkIfRequestedTimeIsAvailable = true;
                                requestedDateBookings.forEach(
                                    booking => {
                                        var bookingStartingTime = booking.startingTime.hour + booking.startingTime.minute / 100;
                                        var bookingEndingTime = booking.endingTime.hour + booking.endingTime.minute / 100;;
                                        if ( // IF ONE OF THESE CONDITIONS IS VERIFIED THEN THE REQUESTED TIME IS NOT AVAILABLE 
                                            (requestedStartingTime < bookingEndingTime && requestedStartingTime > bookingStartingTime) ||
                                            (requestedEndingTime > bookingStartingTime && requestedStartingTime < bookingStartingTime) ||
                                            (requestedStartingTime < bookingEndingTime && requestedEndingTime >= bookingEndingTime) ||
                                            (requestedStartingTime >= bookingStartingTime && requestedEndingTime <= bookingEndingTime) ||
                                            (requestedStartingTime <= bookingStartingTime && requestedEndingTime >= bookingEndingTime)
                                        ) {
                                            checkIfRequestedTimeIsAvailable = false;
                                        }
                                    })
                                if (checkIfRequestedTimeIsAvailable) {
                                    availableRooms.push(room);
                                }
                            }
                        }
                    }
                }
            });
            return res.json(availableRooms);
        });
    },

    /**
     * roomController.show()
     */
    show: function (req, res) {
        var id = req.params.id;
        roomModel.findOne({
            _id: id
        }, function (err, room) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting room.',
                    error: err
                });
            }
            if (!room) {
                return res.status(404).json({
                    message: 'No such room'
                });
            }
            return res.json(room);
        });
    },

    /**
     * roomController.create()
     */
    create: function (req, res) {
        var room = new roomModel({
            name: req.body.name,
            description: req.body.description,
            capacity: req.body.capacity,
            equipements: req.body.equipements,
            createdAt: Date.now(new Date().toISOString()),
            updatedAt: Date.now(new Date().toISOString()),
            available: req.body.available,
            bookings: req.body.bookings,

        });

        room.save(function (err, room) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating room',
                    error: err
                });
            }
            return res.status(201).json(room);
        });
    },

    /**
     * roomController.update()
     */
    update: function (req, res) {
        var id = req.params.id;
        var booking = JSON.parse(req.body.params.updates[0].value);

        roomModel.findOne({
            _id: id
        }, function (err, room) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting room',
                    error: err
                });
            }
            if (!room) {
                return res.status(404).json({
                    message: 'No such room'
                });
            }

            room.name = req.body.name ? req.body.name : room.name;
            room.description = req.body.description ? req.body.description : room.description;
            room.capacity = req.body.capacity ? req.body.capacity : room.capacity;
            room.equipements = req.body.equipements ? req.body.equipements : room.equipements;
            room.createdAt = req.body.createdAt ? req.body.createdAt : room.createdAt;
            room.updatedAt = Date.now(new Date().toISOString());
            room.available = req.body.available ? req.body.available : room.available;
            if (booking) {
                room.bookings.push(booking);
            }
            var toAddBooking = {
                name: room.name,
                bookingDate: booking
            }

            room.save(function (err, room) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating room.',
                        error: err
                    });
                } else {
                    // WE READ THE CONTENT OF THE FILE 'file' AND WE ADD THE LAST BOOKING TO IT. IF IT DOESN'T EXIST WE CREATE IT.
                    fs.readFile(file,
                        (err, data) => {
                            var bookingsInJsonFile = [toAddBooking];
                            if (err) {
                                console.log(err);
                            } else {
                                bookingsInJsonFile = JSON.parse(data);
                                console.log(bookingsInJsonFile);
                                bookingsInJsonFile.push(toAddBooking);
                            }
                            readyToAddInJson = JSON.stringify(bookingsInJsonFile);
                            fs.writeFile(file, readyToAddInJson,
                                (err, res) => {
                                    if (err) throw err;
                                    console.log('Write complete');
                                });
                        });
                    return res.json(room);
                }
            });
        });
    },

    /**
     * roomController.remove()
     */
    remove: function (req, res) {
        var id = req.params.id;
        roomModel.findByIdAndRemove(id, function (err, room) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the room.',
                    error: err
                });
            }
            return res.status(204).json();
        });
    }
};