/// <reference path="../../typings/meteor-typescript-libs/meteor.d.ts" />

function pimpEntityForStorage(entity: Entity): Entity {
  const e = _.clone(entity);
  if (e.name) {
    e._lowercase_name = e.name.toLowerCase();
  }
  return e;
}

function getReferencedIds(entity: Entity, fieldName: string) {
  const referencedEntities = entity[fieldName] as MiniEntity[];
  return referencedEntities.map(e => e._id);
}

function forEachRefField(entity: Entity, f: (referencedEntityIDs: string [], fieldName: string, backwardName: string) => void) {
  const refFields = DataCategories.find({type: FIELD_TYPES.REFERENCE}).fetch();
  refFields.forEach(field => {
    const referencedEntityIDs = getReferencedIds(entity, field.name);
    const backwardName = field.backwardName || field.name;
    f(referencedEntityIDs, field.name, backwardName);
  });
}

class EntitiesFacade {
  static insert(e: Entity) {
    const entityId = Entities.insert(pimpEntityForStorage(e));
    const entity = Entities.findOne(entityId);
    forEachRefField(entity, (referencedEntityIDs, fieldName, backwardName) => {
      Entities.update(
        {_id: {$in: referencedEntityIDs}},
        {$push: {[backwardName]: minifyEntity(entity)}}
      );
    });
    return entityId;
  }

  static update(_id: string, updateSpec: Entity) {
    const oldEntity = Entities.findOne(_id);
    const pimpedUpdateSpec = pimpEntityForStorage(updateSpec);
    Entities.update(_id, {$set: pimpedUpdateSpec});
    const modifiedEntity = Entities.findOne(_id);
    forEachRefField(modifiedEntity, (newReferencedEntityIDs, fieldName, backwardName) => {
      const oldReferencedEntityIDs = getReferencedIds(oldEntity, fieldName);
      const addedIds = _.without(newReferencedEntityIDs, ...oldReferencedEntityIDs);
      Entities.update(
        {_id: {$in: addedIds}},
        {$addToSet: {[backwardName]: minifyEntity(modifiedEntity)}}
      );
      const removedIds = _.without(oldReferencedEntityIDs, ...newReferencedEntityIDs);
      Entities.update(
        {_id: {$in: removedIds}},
        {$pull: {[backwardName]: minifyEntity(modifiedEntity)}}
      );
    });
  }
}

this.EntitiesFacade = EntitiesFacade;