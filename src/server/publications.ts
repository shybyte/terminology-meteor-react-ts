Meteor.publish(PUBLICATIONS.entities, (parameters: any = {}) => {
  const mongoNameSelector = createNameSelector(parameters.nameFilterText);
  const pickLists = PickLists.find({}).fetch();
  const mongoFieldSelector = createMongoSelector(parameters.fieldFilters, pickLists);
  const mongoSelector = assign(assign(mongoNameSelector, mongoFieldSelector), {type: parameters.type});
  // console.log(parameters, JSON.stringify(mongoSelector));
  // const ms = parameters.nameFilterText ? {$text: {$search: parameters.nameFilterText}} : {};
  return Entities.find(mongoSelector, {sort: {_lowercase_name: 1}, limit: parameters.limit || 5});
});


Meteor.publish(PUBLICATIONS.miniEntities, (parameters: EntitySelectorArgs) => {
  const selector = createEntitySelector(parameters);
  // console.log('publish ', selector);
  return Entities.find(selector, {
    fields: {
      _id: 1,
      name: 1,
      type: 1,
      _lowercase_name: 1
    },
    sort: {_lowercase_name: 1},
    limit: parameters.limit || 5
  });
});

Meteor.publish(PUBLICATIONS.entity, (parameters: any = {}) => {
  return Entities.find(parameters._id);
});

Meteor.publish(PUBLICATIONS.dataCategories, () => DataCategories.find({}));

Meteor.publish(PUBLICATIONS.pickLists, () => PickLists.find({}));

Meteor.publish(PUBLICATIONS.commandLog, () => CommandLog.find({},
  {
    sort: {requestTime: -1},
    limit: 20
  })
);

