console.log('publish', PUBLICATIONS.entities);

Meteor.publish(PUBLICATIONS.entities, (parameters: any = {}) => {
  return Entities.find(createNameFilter(parameters.nameFilterText), {sort: {_lowercase_name: 1}, limit: parameters.limit || 5});
});

Meteor.publish(PUBLICATIONS.miniEntities, (parameters: any = {}) => {
  return Entities.find(createNameFilter(parameters.nameFilterText), {
    fields: {
      _id: 1,
      name: 1,
      _lowercase_name: 1
    },
    sort: {_lowercase_name: 1},
    limit: parameters.limit || 5});
});

Meteor.publish(PUBLICATIONS.entity, (parameters: any = {}) => {
  return Entities.find(parameters._id);
});

Meteor.publish(PUBLICATIONS.dataCategories, () => DataCategories.find({}));

Meteor.publish(PUBLICATIONS.pickLists, () => PickLists.find({}));
