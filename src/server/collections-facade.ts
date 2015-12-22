/// <reference path="../../typings/meteor-typescript-libs/meteor.d.ts" />

function pimpEntityForStorage(entity: Entity): Entity {
  const e = _.clone(entity);
  if (e.name) {
    e._lowercase_name = e.name.toLowerCase();
  }
  return e;
}


class EntitiesFacade {
  static insert(e: Entity) {
    Entities.insert(pimpEntityForStorage(e));
  }
  static save(e: Entity) {
    Entities.update(e._id, pimpEntityForStorage(e));
  }
}

this.EntitiesFacade = EntitiesFacade;