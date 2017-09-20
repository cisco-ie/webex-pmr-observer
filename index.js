const debug = require('debug');

export default class PMRObserver {
    constructor(observable, calendarService) {
        if (!observable) {
            throw new Error('Observable is expected, in order to subscribe');
        }

        if (!calendarService) {
            throw new Error('CalendarService is expected');
        }
		
		this.debug = debug('observer-webex-pmr');
        this.observable = observable;
        this.calendar = calendarService;
    }

    handler = (event) => {
        if (this.shouldProcess(event)) {
			this.debug('Correct event, processing');
            this.processEvent(event);
        }
    }

    shouldProcess(event) {
        if (!event.summary) {
            return false;
        }

        const summaryContainsWebex = event.summary.match(/@webex/i);
        if (summaryContainsWebex) {
            return true;
        }
    }

    processEvent = (event) => {
        const descriptionExist = event.description;
        if (descriptionExist) {
            if (event.description.indexOf('WebEx Details') > 0) {
                // do nothing if it already has webex details
                return;
            }
        }

        const existingDescription = (event.description) ? event.description : '';
        const updateInfo = {
            description: this.buildDescription(existingDescription, CMR, event.userId),
            colorId: 9
        };

        const updatedEvent = Object.assign({}, event, updateInfo);
        this.calendar.updateEvent({
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
        observable.subscribe(this.handler);
    }
}
