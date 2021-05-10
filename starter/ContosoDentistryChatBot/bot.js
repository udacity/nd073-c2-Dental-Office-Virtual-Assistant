// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler, MessageFactory } = require('botbuilder');

const { QnAMaker } = require('botbuilder-ai');
const DentistScheduler = require('./dentistscheduler');
const IntentRecognizer = require("./intentrecognizer")

class DentaBot extends ActivityHandler {
    constructor(configuration, qnaOptions) {
        // call the parent constructor
        super();
        if (!configuration) throw new Error('[QnaMakerBot]: Missing parameter. configuration is required');

        // create a QnAMaker connector
        this.qnaMaker = new QnAMaker(configuration.QnAConfiguration, qnaOptions);
        // create a scheduler connector
        this.dentistScheduler = new DentistScheduler(configuration.SchedulerConfiguration);
        // create a LUIS connector
        this.intentRecognizer = new IntentRecognizer(configuration.LuisConfiguration);

        this.onMessage(async (context, next) => {
            // send user input to QnA Maker
            const qnaResults = await this.qnaMaker.getAnswers(context);
            // send user input to LUIS
            const LuisResult = await this.intentRecognizer.executeLuisQuery(context);
            
            // Determine which service to respond with //
            if (LuisResult.luisResult.prediction.topIntent === "ScheduleAppointment" &&
                LuisResult.intents.ScheduleAppointment.score > .6 &&
                LuisResult.entities.$instance && 
                LuisResult.entities.$instance.datetime && 
                LuisResult.entities.$instance.datetime[0]
            ) {
                const time = LuisResult.entities.$instance.datetime[0].text;
                const schedulerResult = await this.dentistScheduler.scheduleAppointment(time);
                await context.sendActivity(schedulerResult);
                await next();
                return;
            }

            if (LuisResult.luisResult.prediction.topIntent === "GetAvailability" && LuisResult.intents.GetAvailability.score > .6) {
                const schedulerResult = await this.dentistScheduler.getAvailability();
                await context.sendActivity(schedulerResult)
                await next();
                return;
            }

            // If an answer was received from QnA Maker, send the answer back to the user.
            if (qnaResults[0]) {
                await context.sendActivity(`${qnaResults[0].answer}`);
            }
            else {
                // If no answers were returned from QnA Maker, reply with help.
                await context.sendActivity(`I'm not sure`
                    + 'The purpose of this bot is to answer frequently asked questions and schedule appointments'
                    + `Ask me questions like "What is times are avaialble for appointments?" or "Do I need insurance?"`);
            }
            await next();
    });

        this.onMembersAdded(async (context, next) => {
        const membersAdded = context.activity.membersAdded;
        const welcomeText = 'Hello and welcome! I am DentaBot. Ask me a question or schedule an appointment.';
        for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
            if (membersAdded[cnt].id !== context.activity.recipient.id) {
                await context.sendActivity(MessageFactory.text(welcomeText, welcomeText));
            }
        }
        // By calling next() you ensure that the next BotHandler is run.
        await next();
    });
    }
}

module.exports.DentaBot = DentaBot;
