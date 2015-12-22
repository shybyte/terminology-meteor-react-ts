
const serverMethods: ServerMethods = {
  createEntity(entity: Entity) {
      EntitiesFacade.insert(entity);
  },
  saveEntity(entity: Entity) {
    EntitiesFacade.save(entity);
  },
};

Meteor.methods(serverMethods);