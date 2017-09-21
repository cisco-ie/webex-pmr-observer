# webex-pmr-observer [![Build Status](https://travis-ci.org/brh55/webex-pmr-observer.svg?branch=master)](https://travis-ci.org/brh55/webex-pmr-observer)

> A WebEx observer to plug into Google Calendar Listener

### Observer Details
**Condition:** `event.summary` contains `/@webex/i` <br>
**Outcome:** <br>
The calendar event details is appended a WebEx PMR url with the calendar owner's Google username as the meeting room.

`e.g. https://cisco.webex.com/meet/janesmith1`

## Install

```
$ npm install --save webex-pmr-observer
```

## Usage
Within an observer file located in `/observer`:

```js
const calendar = require('../controllers/eventController').observable;
const AdministerCalendars = require('../services/AdministerCalendars');
const PMRObserver = require('webex-pmr-observer');

// Construct a new observer instance
// NOTE: You can pass in additional options in the third parameter
const PMRInstance = new PMRObserver(calendar, AdministerCalendars);
// Initiate the instance to begin subscribing
PMRInstance.init();
```

## API

### new Observer(observable, calendarService, opts)

#### Observable

Type: `EventEmitter`

A `rx.js` Observable that emits google Calendar events.


#### calendarService

Type: `Object`

The calendarService provided by `google-calendar-listener` to perform update operations.

#### options

##### cmrDomain
Type: `string`<br>
Default: `cisco`

The CMR (Collaboration Meeting Room) domain that is prefix to the webex url: `https://<cmrDomain>/webex.com/meet/user`

## License

MIT © [Brandon Him](https://github.com/cisco-ie/webex-pmr-observer)
