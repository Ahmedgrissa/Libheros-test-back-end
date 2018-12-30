# Libheros test back-end

## Overview

The server has two major functions:

Returns available rooms based on filters(date, starting time, ending time, capacity, equipements) sent by the client following these steps:
 
* For each conference room in the Database it verifies if the room satisfes the given filters.
* Verifies if the conference is possible in the selected date and time.
* Sends back the rooms available.

Books a room based on the filters chosen by the client. the booking is saved in the distant MongoDB Database and the file "bookings.json".

Besides these two functions, the server provides the basic operations on the room Model:

Create, Show, Delete and Update a room.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Installing

install depencies for the back-end with the following cmd:

```
npm install
```

Start Back-end Server:

```
npm start
```

## Live Version

https://ahmed-grissa-libheros-test.herokuapp.com

## Built With

* [NodeJs](https://nodejs.org/en/about/)
* [ExpressJs](https://expressjs.com/fr/)
* [MongoDB](http://mongodb.com/)



