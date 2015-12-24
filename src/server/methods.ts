const serverMethods: ServerMethods = {
  createEntity(entity: Entity) {
      EntitiesFacade.insert(entity);
  },
  saveEntity(entity: Entity) {
    EntitiesFacade.save(entity);
  },
  createField(field: DataCategory) {
      DataCategories.insert(field);
  },
  deleteField(field: DataCategory) {
      DataCategories.remove(field._id);
  },
};

Meteor.methods(serverMethods);