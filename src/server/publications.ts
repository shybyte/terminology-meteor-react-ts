Meteor.publish(COLLECTIONS.entities, (parameters: any = {}) => {
  return Entities.find(createNameFilter(parameters.nameFilterText), {sort: {_lowercase_name: 1}, limit: parameters.limit || 5});
});

Meteor.publish("entity", (parameters: any = {}) => {
  return Entities.find(parameters._id);
});

Meteor.publish(COLLECTIONS.dataCategories, () => DataCategories.find({}));

Meteor.publish(COLLECTIONS.pickLists, () => PickLists.find({}));
