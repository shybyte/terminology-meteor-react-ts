/// <reference path="../../typings/meteor-typescript-libs/meteor.d.ts" />
/// <reference path="../../typings/chance.d.ts" />
/// <reference path="../../typings/lodash.d.ts" />

namespace  server {
  const chance = new Chance();

  function getAllPickListItems(pickList: PickList): PickListItem[] {
      return pickList.items;
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
            {name: 'Fish', items: []},
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

    const domains = getAllPickListItems(domainPickList);
    const states = getAllPickListItems(statusPickList);

    Entities.remove({});
    _.range(1000).forEach(() => {
      EntitiesFacade.insert({
        name: chance.word(),
        description: chance.sentence(),
        notes: chance.sentence(),
        domain: chance.pick(domains).name,
        status: chance.pick(states).name
      });
    });


  });
}