import EventEmitter from 'events';
import test from 'ava';
import {Observable} from 'rxjs';
import PMRObserver from '.';

const sinon = require('sinon');

const mockEvent = require('./mocks/event.json');

const mockWithSummary = Object.assign({}, mockEvent, {location: '', summary: '@webex'});
const mockNoWebex = Object.assign({}, mockEvent, {location: '', summary: ''});
class TestEmitter extends EventEmitter {}
const mockEmitter = new TestEmitter();
const stubObservable = Observable.fromEvent(mockEmitter, 'CALENDAR_UPDATE').share();
let stubService;
let stubUpdate;

const expectedEvent = {
	kind: 'calendar#event',
	etag: '2940518526114000',
	id: 'event-1',
	status: 'confirmed',
	htmlLink: 'https://www.google.com/calendar/event?eid=NWh1cmRtajY0a3VpbGIzbDM1MDZ1MjVqOHMgYnJoaW1AYXBpZGV2ZGVtby5jb20',
	created: '2016-08-03T21:19:36.000Z',
	updated: '2016-08-04T21:21:03.057Z',
	summary: 'Testing',
	description: 'meet up online\n==== WebEx Details: Do Not Touch ====\nhttp://cisco.webex.com/meet/brhim',
	location: '@webex',
	creator: {
		email: 'brhim@apidevdemo.com'
	},
	organizer: {
		email: 'brhim@apidevdemo.com'
	},
	start: {
		dateTime: '2016-08-15T17:00:00-07:00'
	},
	end: {
		dateTime: '2016-08-16T18:00:00-07:00'
	},
	iCalUID: '5hurdmj64kuilb3l3506u25j8s@google.com',
	sequence: 0,
	attendees: [
		{
			email: 'charmander@apidevdemo.com',
			responseStatus: 'needsAction'
		},
		{
			email: 'dragonite@apidevdemo.com',
			responseStatus: 'needsAction'
		},
		{
			email: 'squirtle@apidevdemo.com',
			responseStatus: 'needsAction'
		},
		{
			email: 'pikachu@apidevdemo.com',
			organizer: true,
			self: true,
			responseStatus: 'accepted'
		}
	],
	hangoutLink: 'https://plus.google.com/hangouts/_/apidevdemo.com/brhim-damyers2?hceid=YnJoaW1AYXBpZGV2ZGVtby5jb20.5hurdmj64kuilb3l3506u25j8s',
	reminders: {
		useDefault: true
	},
	colorId: 9,
	calendarId: 'brhim@apidevdemo.com',
	userId: 'brhim'
};

// Reassign the stubs so the calls counters are reset
test.beforeEach(() => {
	stubUpdate = sinon.stub().resolves('success');
	stubService = {
		updateEvent: stubUpdate
	};
});

test.serial('Update on relevant event', t => {
	const observer = new PMRObserver(stubObservable, stubService);
	observer.init();
	mockEmitter.emit('CALENDAR_UPDATE', mockEvent);

	t.truthy(stubUpdate.calledWith({calendarId: 'brhim@apidevdemo.com', eventId: 'event-1'}, expectedEvent));
});

test.serial('Don\'t update event', t => {
	const observer = new PMRObserver(stubObservable, stubService);
	observer.init();
	mockEmitter.emit('CALENDAR_UPDATE', mockNoWebex);

	t.falsy(stubUpdate.called);
});

test.serial('Update based on options', t => {
	const observer = new PMRObserver(stubObservable, stubService, {field: 'summary', cmrDomain: 'test'});
	observer.init();
	mockEmitter.emit('CALENDAR_UPDATE', mockWithSummary);

	const description = `meet up online\n==== WebEx Details: Do Not Touch ====\nhttp://test.webex.com/meet/brhim`;
	const updatedEvent = Object.assign({}, expectedEvent, {description, summary: '@webex', location: ''});

	t.truthy(stubUpdate.calledWith({calendarId: 'brhim@apidevdemo.com', eventId: 'event-1'}, updatedEvent));
});
