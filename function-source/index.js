// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';
 
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
 
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
const Datastore = require('@google-cloud/datastore');
const datastore = new Datastore({ projectId: 'qwiklabs-gcp-03-0f5a9d1ba6bc'});
 
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 
  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }
 
  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }
  
  // handling pizza orders
  function order_pizza(agent) {
      var pizza_size = agent.parameters.size;
      var pizza_topping = agent.parameters.pizza_topping;
      var time = agent.parameters.time;
      const taskKey = datastore.key('order_item');
      const entity = {
        key: taskKey,
        data: {
        item_name: 'pizza',
        topping: pizza_topping,
        time: time,
        order_time: new Date().toLocaleString(),
        size: pizza_size }
       };
      return datastore.save(entity).then(() => {
                console.log(`Saved ${entity.key.name}: ${entity.data.item_name}`);
                agent.add(`Your order for ${pizza_topping} pizza has been placed! Would you like a drink with your order?`);

             });
     }
  
  // handling drink orders
  function order_drink(agent) {
       var drink = agent.parameters.drink_composite.drink;
       var flavor = agent.parameters.drink_composite.flavor;
       var number = agent.parameters.number;
       const taskKey = datastore.key('order_item');
       const entity = {
         key: taskKey,
         data: {
         item_name: 'drink',
         drink: drink,
         flavor: flavor,
         number: number}
        };
       return datastore.save(entity).then(() => {
                 console.log(`Saved ${entity.key.name}: ${entity.data.item_name}`);
                 agent.add(`Your order for ${number} ${flavor} ${drink}s has been placed!`);
              });
}

  // // Uncomment and edit to make your own intent handler
  // // uncomment `intentMap.set('your intent name here', yourFunctionHandler);`
  // // below to get this function to be run when a Dialogflow intent is matched
  // function yourFunctionHandler(agent) {
  //   agent.add(`This message is from Dialogflow's Cloud Functions for Firebase editor!`);
  //   agent.add(new Card({
  //       title: `Title: this is a card title`,
  //       imageUrl: 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
  //       text: `This is the body text of a card.  You can even use line\n  breaks and emoji! 💁`,
  //       buttonText: 'This is a button',
  //       buttonUrl: 'https://assistant.google.com/'
  //     })
  //   );
  //   agent.add(new Suggestion(`Quick Reply`));
  //   agent.add(new Suggestion(`Suggestion`));
  //   agent.setContext({ name: 'weather', lifespan: 2, parameters: { city: 'Rome' }});
  // }

  // // Uncomment and edit to make your own Google Assistant intent handler
  // // uncomment `intentMap.set('your intent name here', googleAssistantHandler);`
  // // below to get this function to be run when a Dialogflow intent is matched
  // function googleAssistantHandler(agent) {
  //   let conv = agent.conv(); // Get Actions on Google library conv instance
  //   conv.ask('Hello from the Actions on Google client library!') // Use Actions on Google library
  //   agent.add(conv); // Add Actions on Google library responses to your agent's response
  // }
  // // See https://github.com/dialogflow/fulfillment-actions-library-nodejs
  // // for a complete Dialogflow fulfillment library Actions on Google client library v2 integration sample

  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set('order.pizza', order_pizza);
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  // intentMap.set('your intent name here', yourFunctionHandler);
  // intentMap.set('your intent name here', googleAssistantHandler);
  agent.handleRequest(intentMap);
});
