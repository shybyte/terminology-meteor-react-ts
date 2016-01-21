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

function updateNameInReferences(modifiedEntity: Entity, fieldName: string) {
  Entities.update(
    {
      [fieldName + '._id']: modifiedEntity._id
    },
    {
      $set: {
        [fieldName + '.$']: minifyEntity(modifiedEntity)
      }
    },
    {multi: true}
  );
}

function removeReferencesInOtherEntitiesIfNeeded(modifiedEntity: Entity, field: DataCategory, referencedIds: string[]) {
  if (field.backwardMulti || _.isEmpty(referencedIds)) {
    return;
  }
  Entities.update(
    {
      _id: {$ne: modifiedEntity._id},
      [field.name + '._id']: {$in: referencedIds}
    },
    {
      $pull: {
        [field.name]: {_id: {$in: referencedIds}}
      }
    },
    {multi: true}
  );
}

function removeEntityRef(entityIDs: string[], fieldName: string, entityID: string) {
  Entities.update(
    {_id: {$in: entityIDs}},
    {$pull: {[fieldName]: {_id: entityID}}},
    {multi: true}
  );
}

function addOrReplaceBackwardEntityRef(entityIDs: string[], field: DataCategory, newEntityReference: Entity) {
  const backwardName = field.backwardName || field.name;
  const miniEntity = minifyEntity(newEntityReference);
  const modifier = field.backwardMulti ? {$addToSet: {[backwardName]: miniEntity}} : {$set: {[backwardName]: [miniEntity]}};
  Entities.update(
    {_id: {$in: entityIDs}},
    modifier,
    {multi: true}
  );

  if (field.backwardName && newEntityReference[field.backwardName]) {
    const refs = newEntityReference[field.backwardName] as MiniEntity[];
    Entities.update(
      {_id: {$in: refs.map(ref => ref._id)}},
      {$addToSet: {[field.name]: miniEntity}},
      {multi: true}
    );
  }

}

function propagateInheritedFields(modifiedEntity: Entity, field: DataCategory, referencedEntityIDs: string[], removedReferencedEntityIDs: string[] = []) {
  if (!field.inherit) {
    return;
  }

  const allFields = DataCategories.find({}).fetch();

  // Inherit only fields that does not cause inheritance
  const fieldToInherit = allFields.filter(f => !f.inherit && _.contains(f.entityTypes, ENTITY_TYPES.C));
  const keysToInherit = fieldToInherit.map(f => f.name).concat(fieldToInherit.map(f => f.backwardName)).filter(_.isString);

  if (!_.isEmpty(referencedEntityIDs)) {
    // inherit to "children"
    const inheritUpdateSpec = _.pick(modifiedEntity, keysToInherit);
    Entities.update(
      {_id: {$in: referencedEntityIDs}},
      {$set: inheritUpdateSpec},
      {multi: true}
    );
  }

  if (_.contains(field.entityTypes, modifiedEntity.type) && !_.isEmpty(removedReferencedEntityIDs)) {
    // Remove inherited fields in children
    Entities.update(
      {_id: {$in: removedReferencedEntityIDs}},
      {$unset: _.zipObject(keysToInherit.map(k => [k, '']))},
      {multi: true}
    );
  }


  const backwardRefs = modifiedEntity[field.backwardName] as MiniEntity[];
  if (!_.isEmpty(backwardRefs)) {
    // inherit from "parent"
    const parent = Entities.findOne(backwardRefs[0]._id);
    if (parent) {
      const inheritUpdateSpec = _.pick(parent, keysToInherit);
      Entities.update(
        {_id: modifiedEntity._id},
        {$set: inheritUpdateSpec}
      );
    }
  }
}

class EntitiesFacade {
  static insert(e: EntityInsert, options: {refFields?: DataCategory[]} = {}) {
    const pimpedEntityData = pimpEntityForStorage(e) as Entity;
    const entityId = Entities.insert(pimpedEntityData);
    const entity = assign(pimpedEntityData, {_id: entityId});
    forEachRefField(entity, (referencedEntityIDs, field) => {
      addOrReplaceBackwardEntityRef(referencedEntityIDs, field, entity);
      removeReferencesInOtherEntitiesIfNeeded(entity, field, referencedEntityIDs);
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
        updateNameInReferences(modifiedEntity, fieldName);
        if (fieldName != backwardName) {
          updateNameInReferences(modifiedEntity, backwardName);
        }
      }
      const oldReferencedEntityIDs = getReferencedIds(oldEntity, fieldName);
      const addedIds = _.without(newReferencedEntityIDs, ...oldReferencedEntityIDs);
      addOrReplaceBackwardEntityRef(addedIds, field, modifiedEntity);
      removeReferencesInOtherEntitiesIfNeeded(modifiedEntity, field, newReferencedEntityIDs);
      const removedIds = _.without(oldReferencedEntityIDs, ...newReferencedEntityIDs);
      removeEntityRef(removedIds, backwardName, modifiedEntity._id);
      propagateInheritedFields(modifiedEntity, field, newReferencedEntityIDs, removedIds);
    });
  }

  static delete(_id: string) {
    Entities.remove(_id);
    const refFields = DataCategories.find({type: FIELD_TYPES.REFERENCE}).fetch();
    refFields.forEach(field => {
      Entities.update(
        {[field.name + '._id']: _id},
        {$pull: {[field.name]: {_id: _id}}},
        {multi: true}
      );
      if (field.backwardName) {
        refFields.forEach(field => {
          Entities.update(
            {[field.backwardName + '._id']: _id},
            {$pull: {[field.backwardName]: {_id: _id}}},
            {multi: true}
          );
        });
      }
    });
  }

}

this.EntitiesFacade = EntitiesFacade;