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
    ['description', 'notes'].map(name => ({
      name,
      type: FIELD_TYPES.TEXT,
      multi: false
    })).forEach(dataCategory => {
      DataCategories.insert(dataCategory);
    });

    DataCategories.insert({name: 'domain', multi: true, type: FIELD_TYPES.PICK_LIST, pickListId: domainPickListId});
    DataCategories.insert({name: 'status', multi: false, type: FIELD_TYPES.PICK_LIST, pickListId: statusPickListId});
    DataCategories.insert({name: 'eats', multi: true, type: FIELD_TYPES.REFERENCE, backwardName: 'eaten_by'});
    DataCategories.insert({name: 'similar', multi: true, type: FIELD_TYPES.REFERENCE});
    const refFields = DataCategories.find({type: FIELD_TYPES.REFERENCE}).fetch();

    const domains = getDescendantPickListItems(domainPickList);
    const states = getDescendantPickListItems(statusPickList);

    Entities.remove({});
    const start = Date.now();
    console.log('Adding dummy entities...');
    const dummySentences = _.range(40).map(() => chance.sentence());
    const dummyDomainSets = _.range(40).map(() => pick(domains, chance.d4() - 1).map(f => f.name));
    const entityIds: string[] = [];
    const miniEntityById: {[key: string] : MiniEntity} = {};
    _.range(100).forEach(() => {
      const eatsIDs = pick(entityIds, chance.d4() - 1);
      const eatsEntities = eatsIDs.map(id => miniEntityById[id]);
      const similarIDs = pick(entityIds, chance.d4() - 1);
      const similarEntities = similarIDs.map(id => miniEntityById[id]);
      const newEntityData: EntityInsert = {
        type: chance.pick([ENTITY_TYPES.C, ENTITY_TYPES.T]),
        name: chance.word(),
        description: chance.pick(dummySentences),
        notes: chance.pick(dummySentences),
        domain: chance.pick(dummyDomainSets),
        status: [chance.pick(states).name],
        eats: eatsEntities,
        similar: similarEntities
      };
      const id = EntitiesFacade.insert(newEntityData, {refFields});
      entityIds.push(id);
      miniEntityById[id] = minifyEntity(assign(newEntityData, {_id: id}));
    });
    console.log('Time for adding dummy entities11: ', Date.now() - start);
  });
}