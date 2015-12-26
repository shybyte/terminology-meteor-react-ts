/// <reference path="../../typings/meteor-typescript-libs/meteor.d.ts" />

function pimpEntityForStorage(entity: Entity): Entity {
  const e = _.clone(entity);
  if (e.name) {
    e._lowercase_name = e.name.toLowerCase();
  }
  return e;
}

function pimpUpdateSpecForStorage(updateSpec: any) {
  if (updateSpec.$set) {
    return assign(updateSpec, {$set: pimpEntityForStorage(updateSpec.$set)});
  } else {
    return pimpEntityForStorage(updateSpec);
  }
}


class EntitiesFacade {
  static insert(e: Entity) {
    return Entities.insert(pimpEntityForStorage(e));
  }
  static update(_id: string, updateSpec: any) {
    return Entities.update(_id, pimpUpdateSpecForStorage(updateSpec));
  }
}

this.EntitiesFacade = EntitiesFacade;