const autoBind = require('auto-bind');
const debug = require('debug');

module.exports = class PMRObserver {
    constructor(observable, calendarService, opts = {}) {
        if (!observable) {
            throw new Error('Observable is expected, in order to subscribe');
        }

        if (!calendarService) {
            throw new Error('CalendarService is expected');
        }

        this.debug = debug('observer::webex-pmr');
        this.calendars = observable;
        this.calendarService = calendarService;
        this.cmrDomain = opts.cmrDomain || 'cisco';
        this.field = opts.field || 'summary';

        autoBind(this);
    }

    handler (event) {
        if (this.shouldProcess(event)) {
            this.debug('Contains @webex, processing');
            this.processEvent(event);
        }
    }

    shouldProcess(event) {
        const conditionField = event[this.field];
        if (conditionField) {
            return false;
        }

        const containsWebex = conditionField.match(/@webex/i);
        if (containsWebex) {
            return true;
        }
    }

    processEvent (event) {
        const descriptionExist = event.description;
        if (descriptionExist) {
            if (event.description.indexOf('WebEx Details') > 0) {
                // do nothing if it already has webex details
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
}
