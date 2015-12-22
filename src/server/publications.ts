Meteor.publish("entities", (parameters: any = {}) => {
  return Entities.find(createNameFilter(parameters.nameFilterText), {sort: {name: 1}, limit: parameters.limit || 5});
});

Meteor.publish("entity", (parameters: any = {}) => {
  return Entities.find(parameters._id);
});

Meteor.publish("dataCategories", () => DataCategories.find({}));
