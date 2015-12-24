/// <reference path="../../typings/meteor-typescript-libs/meteor.d.ts" />
/// <reference path="../../typings/chance.d.ts" />
/// <reference path="../../typings/lodash.d.ts" />

namespace  server {
  const chance = new Chance();

  Meteor.startup(function () {
    // if (Entities.find().count() > 0) {
    //    return;
    // }

    PickLists.remove({});
    PickLists.insert({
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

    PickLists.insert({
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



    DataCategories.remove({});
    ['title', 'description', 'notes'].map(name => ({name})).forEach(dataCategory => {
      DataCategories.insert(dataCategory);
    });

    const dataCategories = DataCategories.find({}).fetch();

    Entities.remove({});
    _.range(1000).forEach(() => {
      const keyValuePairs = dataCategories.map(dc => [dc.name, dc.name + ' ' + chance.word()]);
      EntitiesFacade.insert(assign({name: chance.word()}, _.zipObject(keyValuePairs)));
    });


  });
}