/// <reference path="../../typings/meteor-typescript-libs/meteor.d.ts" />
/// <reference path="../../typings/chance.d.ts" />
/// <reference path="../../typings/lodash.d.ts" />

namespace  server {
  const _ = lodash as _.LoDashStatic;
  const chance = new Chance();

  Meteor.startup(function () {
    // if (Entities.find().count() > 0) {
    //    return;
    // }

    Entities.remove({});
    _.range(1000).forEach(() => {
      Entities.insert({
        name: chance.word(),
      });
    });

  });
}