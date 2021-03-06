const autoBind = require('auto-bind');
const debug = require('debug');

module.exports = class PMRObserver {
	constructor(observable, calendarService, opts = {}) {
		if (!observable) {
			throw new Error('An observable is expected, in order to subscribe to calendars');
		}

		if (!calendarService) {
			throw new Error('A calendarService is expected');
		}

		this.debug = debug('observer::webex-pmr');
		this.calendars = observable;
		this.calendarService = calendarService;
		this.cmrDomain = opts.cmrDomain || 'cisco';
		this.field = opts.field || 'location';
		autoBind(this);
	}

	handler(event) {
		if (this.shouldProcess(event)) {
			this.debug('Contains @webex, processing');
			this.processEvent(event);
		}
	}

	shouldProcess(event) {
		if (event.status !== 'confirmed') {
			debug('Not a confirmed event, will not process');
			return false;
		}

		const conditionField = event[this.field];
		if (!conditionField) {
			return false;
		}

		const containsWebex = conditionField.match(/@webex/i);
		if (containsWebex) {
			return true;
		}
	}

	processEvent(event) {
		const descriptionExist = event.description;
		if (descriptionExist) {
			if (event.description.indexOf('WebEx Details') > 0) {
				// do nothing if it already has webex details
				debug('Already contains WebEx details, disregard');
				return;
			}
		}

		const existingDescription = (event.description) ? event.description : '';
		const updateInfo = {
			description: this.buildDescription(existingDescription, this.cmrDomain, event.userId),
			colorId: 9
		};
		const updatedEvent = Object.assign({}, event, updateInfo);

		this.calendarService.updateEvent({
			calendarId: event.calendarId,
			eventId: event.id
		}, updatedEvent)
		.then(() => this.debug(`Sucessfully update ${event.calendarId}'s event: ${event.id}`))
		.catch(this.debug);
	}

	buildDescription(existingDescription, cmrSite, userId) {
		return `${existingDescription}
==== WebEx Details: Do Not Touch ====
http://${cmrSite}.webex.com/meet/${userId}`;
	}

	init() {
		this.calendars.subscribe(this.handler);
		this.debug('Subscribed to Calendars');
	}
};
