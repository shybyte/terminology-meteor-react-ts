/// <reference path="../../typings/meteor-typescript-libs/meteor.d.ts" />
/// <reference path="../../typings/chance.d.ts" />
/// <reference path="../../typings/lodash.d.ts" />

namespace  server {
  const chance = new Chance();

  Meteor.startup(function () {
    // if (Entities.find().count() > 0) {
    //    return;
    // }

    DataCategories.remove({});
    ['title', 'description', 'notes'].map(name => ({name})).forEach(dataCategory => {
      DataCategories.insert(dataCategory);
    });

    const dataCategories = DataCategories.find({}).fetch();

    Entities.remove({});
    _.range(1000).forEach(() => {
      const keyValuePairs = dataCategories.map(dc => [dc.name, dc.name + ' ' + chance.word()]);
      Entities.insert(assign({name: chance.word()}, _.zipObject(keyValuePairs)));
    });



  });
}