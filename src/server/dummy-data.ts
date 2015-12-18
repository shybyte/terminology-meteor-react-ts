Meteor.startup(function () {
  if (Tasks.find().count() === 0) {
    Tasks.insert({
      text: "Hello Wold!",
      createdAt:new Date()
    });
    Tasks.insert({
      text: "Hola Mundo!",
      createdAt:new Date()
    });
  }
});