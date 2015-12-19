Meteor.publish("entities", function (parameters: any = {}) {
  return Entities.find(createNameFilter(parameters.nameFilterText), {sort: {name: 1},limit: parameters.limit || 5});
});
