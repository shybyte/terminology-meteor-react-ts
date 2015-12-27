/// <reference path="../../typings/meteor-typescript-libs/meteor.d.ts" />
/// <reference path="../../typings/chance.d.ts" />
/// <reference path="../../typings/lodash.d.ts" />

namespace  server {
  const chance = new Chance();

  function pick<T>(array: T[], number: number) {
    if (array.length === 0 || number === 0) {
      return [];
    }
    const result = chance.pick(array, number);
    return Array.isArray(result) ? result : [result];
  }


  Meteor.startup(function () {
    // if (Entities.find().count() > 0) {
    //    return;
    // }

    PickLists.remove({});
    const domainPickListId = PickLists.insert({
      name: 'Domain',
      items: [
        {
          name: 'Animal',
          items: [
            {name: 'Insect', items: []},
            {
              name: 'Fish', items: [
              {
                name: 'Shark',
                items: [],
              }, {
                name: 'Clownfish',
                items: [],
              }]
            },
          ]
        },
        {
          name: 'Plant',
          items: [
            {name: 'Tree', items: []}
          ]
        }
      ]
    });
    const domainPickList = PickLists.findOne(domainPickListId);

    const statusPickListId = PickLists.insert({
      name: 'Status',
      items: [
        {
          name: 'Preferred',
          items: []
        },
        {
          name: 'Deprecated',
          items: []
        }
      ]
    });
    const statusPickList = PickLists.findOne(statusPickListId);


    DataCategories.remove({});
    ['description', 'notes'].map(name => ({name, type: FIELD_TYPES.TEXT})).forEach(dataCategory => {
      DataCategories.insert(dataCategory);
    });

    DataCategories.insert({name: 'domain', type: FIELD_TYPES.PICK_LIST, pickListId: domainPickListId});
    DataCategories.insert({name: 'status', type: FIELD_TYPES.PICK_LIST, pickListId: statusPickListId});
    DataCategories.insert({name: 'eats', type: FIELD_TYPES.REFERENCE, backwardName: 'eaten_by'});
    DataCategories.insert({name: 'similar', type: FIELD_TYPES.REFERENCE});

    const domains = getDescendantPickListItems(domainPickList);
    const states = getDescendantPickListItems(statusPickList);

    Entities.remove({});
    const entityIds: string[] = [];
    _.range(100).forEach(() => {
      const eatsIDs = pick(entityIds, chance.d4() - 1);
      const eatsEntities = Entities.find({_id: {$in: eatsIDs}}).fetch();
      const similarIDs = pick(entityIds, chance.d4() - 1);
      const similarEntities = Entities.find({_id: {$in: similarIDs}}).fetch();
      const id = EntitiesFacade.insert({
        name: chance.word(),
        description: chance.sentence(),
        notes: chance.sentence(),
        domain: chance.pick(domains).name,
        status: chance.pick(states).name,
        eats: eatsEntities.map(minifyEntity),
        similar: similarEntities.map(minifyEntity)
      });
      entityIds.push(id);
    });
  });
}