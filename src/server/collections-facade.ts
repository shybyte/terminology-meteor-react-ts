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
    return Entities.insert(pimpEntityForStorage(e));
  }
  static save(e: Entity) {
    return Entities.update(e._id, pimpEntityForStorage(e));
  }
  static update(_id: string, updateSpec: any) {
    return Entities.update(_id, updateSpec);
  }
}

this.EntitiesFacade = EntitiesFacade;