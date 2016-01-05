/// <reference path="../../typings/meteor-typescript-libs/meteor.d.ts" />

function pimpEntityForStorage(entity: EntityUpdate): EntityUpdate {
  const e = _.clone(entity);
  if (e.name) {
    e._lowercase_name = e.name.toLowerCase();
  }
  return e;
}

function getReferencedIds(entity: Entity, fieldName: string) {
  const referencedEntities = (entity[fieldName] || []) as MiniEntity[];
  return referencedEntities.map(e => e._id);
}

function forEachRefField(entity: Entity, f: (referencedEntityIDs: string [], field: DataCategory, fieldName: string, backwardName: string) => void, options: {refFields?: DataCategory[]} = {}) {
  const refFields = options.refFields || DataCategories.find({type: FIELD_TYPES.REFERENCE}).fetch();
  refFields.forEach(field => {
    const referencedEntityIDs = getReferencedIds(entity, field.name);
    const backwardName = field.backwardName || field.name;
    f(referencedEntityIDs, field, field.name, backwardName);
  });
}

function updateNameInReferences(modifiedEntity: Entity, referencesIds: string [], fieldName: string, backwardName: string) {
  updateEntityRef(referencesIds, backwardName, modifiedEntity);
  if (fieldName !== backwardName) {
    const referencesToMe = getReferencedIds(modifiedEntity, backwardName);
    updateEntityRef(referencesToMe, fieldName, modifiedEntity);
  }
}

function updateEntityRef(entityIDs: string[], fieldName: string, updatedEntity: Entity) {
  removeEntityRef(entityIDs, fieldName, updatedEntity._id);
  addEntityRef(entityIDs, fieldName, updatedEntity);
}

function removeEntityRef(entityIDs: string[], fieldName: string, entityID: string) {
  Entities.update(
    {_id: {$in: entityIDs}},
    {$pull: {[fieldName]: {_id: entityID}}},
    {multi: true}
  );
}

function addEntityRef(entityIDs: string[], fieldName: string, newEntityReference: Entity) {
  Entities.update(
    {_id: {$in: entityIDs}},
    {$addToSet: {[fieldName]: minifyEntity(newEntityReference)}},
    {multi: true}
  );
}

function propagateInheritedFields(modifiedEntity: Entity, field: DataCategory, referencedEntityIDs: string[]) {
  if (field.inherit && !_.isEmpty(referencedEntityIDs)) {
    const allFields = DataCategories.find({}).fetch();
    const keysToInherit = allFields.filter(f => f.type != FIELD_TYPES.REFERENCE);
    const inheritUpdateSpec = _.pick(modifiedEntity, _.intersection(keysToInherit.map(f => f.name)));
    referencedEntityIDs.forEach(addedId => {
      Entities.update(
        {_id: addedId},
        {$set: inheritUpdateSpec}
      );
    });
  }
}

class EntitiesFacade {
  static insert(e: EntityInsert, options: {refFields?: DataCategory[]} = {}) {
    const pimpedEntityData = pimpEntityForStorage(e) as Entity;
    const entityId = Entities.insert(pimpedEntityData);
    const entity = assign(pimpedEntityData, {_id: entityId});
    forEachRefField(entity, (referencedEntityIDs, field, fieldName, backwardName) => {
      addEntityRef(referencedEntityIDs, backwardName, entity);
      propagateInheritedFields(entity, field, referencedEntityIDs);
    }, options);
    return entityId;
  }

  static update(_id: string, entityUpdate: EntityUpdate) {
    const oldEntity = Entities.findOne(_id);
    const pimpedUpdateSpec = pimpEntityForStorage(entityUpdate);
    Entities.update(_id, {$set: pimpedUpdateSpec});
    const modifiedEntity = Entities.findOne(_id);
    forEachRefField(modifiedEntity, (newReferencedEntityIDs, field, fieldName, backwardName) => {
      if (oldEntity.name != modifiedEntity.name) {
        updateNameInReferences(modifiedEntity, newReferencedEntityIDs, fieldName, backwardName);
      }
      const oldReferencedEntityIDs = getReferencedIds(oldEntity, fieldName);
      const addedIds = _.without(newReferencedEntityIDs, ...oldReferencedEntityIDs);
      addEntityRef(addedIds, backwardName, modifiedEntity);
      const removedIds = _.without(oldReferencedEntityIDs, ...newReferencedEntityIDs);
      removeEntityRef(removedIds, backwardName, modifiedEntity._id);
      propagateInheritedFields(modifiedEntity, field, newReferencedEntityIDs);
    });
  }


}

this.EntitiesFacade = EntitiesFacade;