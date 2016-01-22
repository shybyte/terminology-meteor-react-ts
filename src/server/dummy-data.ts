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

    DataCategories.insert({
      name: 'description',
      type: FIELD_TYPES.TEXT,
      entityTypes: [ENTITY_TYPES.C],
      multi: false,
      system: false,
      inherit: false,
    });
    DataCategories.insert({
      name: 'notes',
      type: FIELD_TYPES.TEXT,
      entityTypes: [ENTITY_TYPES.T],
      multi: false,
      system: false,
      inherit: false,
    });

    DataCategories.insert({
      name: 'domain',
      entityTypes: [ENTITY_TYPES.C],
      multi: true,
      type: FIELD_TYPES.PICK_LIST,
      pickListId: domainPickListId,
      system: false,
      inherit: false,
    });
    DataCategories.insert({
      name: 'status',
      entityTypes: [ENTITY_TYPES.T],
      multi: false,
      type: FIELD_TYPES.PICK_LIST,
      pickListId: statusPickListId,
      system: false,
      inherit: false,
    });
    DataCategories.insert({
      name: 'eats',
      entityTypes: [ENTITY_TYPES.C],
      targetEntityTypes: [ENTITY_TYPES.C],
      multi: true,
      backwardMulti: true,
      type: FIELD_TYPES.REFERENCE,
      backwardName: 'eaten_by',
      system: false,
      inherit: false,
    });
    DataCategories.insert({
      name: 'similar',
      entityTypes: [ENTITY_TYPES.C],
      targetEntityTypes: [ENTITY_TYPES.C],
      multi: true,
      backwardMulti: true,
      type: FIELD_TYPES.REFERENCE,
      system: false,
      inherit: false,
    });

    DataCategories.insert(TERMS_REFERENCE);

    const refFields = DataCategories.find({type: FIELD_TYPES.REFERENCE}).fetch();

    const domains = getDescendantPickListItems(domainPickList);
    const states = getDescendantPickListItems(statusPickList);

    Entities.remove({});
    const start = Date.now();
    console.log('Adding dummy entities...');

    const dummyText = Assets.getText('dummy-text.txt');
    const dummySentences = dummyText.replace(/[\n\t ]+/g, ' ').split('.').map(s => s.trim() + '.').filter(s => s.length < 100);
    // console.log(dummySentences);

    const dummyDomainSets = _.range(40).map(() => pick(domains, chance.d4() - 1).map(f => f.name));
    const entityIds: string[] = [];
    const miniConcepts: MiniEntity[] = [];
    const miniEntityById: {[key: string] : MiniEntity} = {};

    function createRandomEntity(type: string): EntityInsert {
      const eatsIDs = pick(entityIds, chance.d4() - 1);
      const eatsEntities = eatsIDs.map(id => miniEntityById[id]);
      const similarIDs = pick(entityIds, chance.d4() - 1);
      const similarEntities = similarIDs.map(id => miniEntityById[id]);
      const name = chance.word();
      const nameUp = name.slice(0, 1).toUpperCase() + name.slice(1);
      if (type === ENTITY_TYPES.C) {
        return {
          type: type,
          name: chance.pick([name, nameUp]),
          description: chance.pick(dummySentences),
          domain: chance.pick(dummyDomainSets),
          eats: eatsEntities,
          similar: similarEntities
        };
      } else {
        return {
          type: type,
          [TERMS_REFERENCE.backwardName]: chance.bool() ? [] : [chance.pick(miniConcepts)],
          // [TERMS_REFERENCE.backwardName]: [chance.pick(miniConcepts)],
          name: chance.pick([name, nameUp]),
          notes: chance.pick(dummySentences),
          status: [chance.pick(states).name],
        };
      }
    }

    _.range(20).forEach(() => {
      const newEntityData = createRandomEntity(ENTITY_TYPES.C);
      const id = EntitiesFacade.insert(newEntityData, {refFields});
      entityIds.push(id);
      const miniEntity = minifyEntity(assign(newEntityData, {_id: id}));
      miniEntityById[id] = miniEntity;
      miniConcepts.push(miniEntity);
    });

    _.range(100).forEach(() => {
      const newEntityData = createRandomEntity(ENTITY_TYPES.T);
      const id = EntitiesFacade.insert(newEntityData, {refFields});
      entityIds.push(id);
      miniEntityById[id] = minifyEntity(assign(newEntityData, {_id: id}));
    });


    EntitiesFacade.insert({
      name: 'time',
      notes: 'nothing',
      type: ENTITY_TYPES.T
    });
    EntitiesFacade.insert({
      name: 'nothing',
      notes: 'time',
      type: ENTITY_TYPES.T
    });

    console.log('Time for adding dummy entities: ', Date.now() - start);
  });
}