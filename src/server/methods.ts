const serverMethods: ServerMethods = {
  createEntity(entity: Entity) {
    Entities.insert(entity);
  },
  saveEntity(entity: Entity) {
    Entities.update(entity._id, entity);
  },
};

Meteor.methods(serverMethods);