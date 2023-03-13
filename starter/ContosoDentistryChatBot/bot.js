// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler, MessageFactory } = require('botbuilder');

const { QnAMaker, CustomQuestionAnswering } = require('botbuilder-ai');
const DentistScheduler = require('./dentistscheduler');
const IntentRecognizer = require("./intentrecognizer")

class DentaBot extends ActivityHandler {
    constructor(configuration, qnaOptions) {
        // call the parent constructor
        super();
        if (!configuration) throw new Error('[QnaMakerBot]: Missing parameter. configuration is required');

        // create a QnAMaker connector
        try {
            this.qnAMaker = new CustomQuestionAnswering(configuration.QnAConfiguration);
        }  catch (err) {
            console.warn(`QnAMaker Exception: ${ err } Check your QnAMaker configuration in .env`);
        }
       
        // create a DentistScheduler connector
      
        // create a IntentRecognizer connector


        this.onMessage(async (context, next) => {
            // send user input to QnA Maker and collect the response in a variable
            // don't forget to use the 'await' keyword
            const qnaResults = await this.qnAMaker.getAnswers(context);

            if (qnaResults[0]) {
                console.log(qnaResults[0])
                await context.sendActivity(`${qnaResults[0].answer}`);
             }

            
            // If an answer was received from CQA, send the answer back to the user.
            // if (response.length > 0) {
            //     var activities = [];

            //     var answerText = response[0].answer;

            //     // Answer span text has precise answer.
            //     var preciseAnswerText = response[0].answerSpan?.text;
            //     if (!preciseAnswerText) {
            //         activities.push({ type: ActivityTypes.Message, text: answerText });
            //     } else {
            //         activities.push({ type: ActivityTypes.Message, text: preciseAnswerText });

            //         if (!displayPreciseAnswerOnly) {
            //             // Add answer to the reply when it is configured.
            //             activities.push({ type: ActivityTypes.Message, text: answerText });
            //         }
            //     }
            //     await context.sendActivities(activities);
            //     // If no answers were returned from QnA Maker, reply with help.
            // } else {
            //     await context.sendActivity('No answers were found.');
            //}
          
            // send user input to IntentRecognizer and collect the response in a variable
            // don't forget 'await'
                     
            // determine which service to respond with based on the results from LUIS //

            // if(top intent is intentA and confidence greater than 50){
            //  doSomething();
            //  await context.sendActivity();
            //  await next();
            //  return;
            // }
            // else {...}
             
            await next();
    });

        this.onMembersAdded(async (context, next) => {
        const membersAdded = context.activity.membersAdded;
        //write a custom greeting
        const welcomeText = 'welcome to the dental office';
        for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
            if (membersAdded[cnt].id !== context.activity.recipient.id) {
                await context.sendActivity(MessageFactory.text(welcomeText, welcomeText));
            }
        }
        // by calling next() you ensure that the next BotHandler is run.
        await next();
    });
    }
}

module.exports.DentaBot = DentaBot;
