const serverMethods: ServerMethods = {
  createEntity(entity: Entity) {
    EntitiesFacade.insert(entity);
  },
  updateEntity(_id: string, entity: Entity) {
    EntitiesFacade.update(_id, entity);
  },
  deleteEntity(_id: string) {
    EntitiesFacade.deleteEntity(_id);
  },
  createField(field: DataCategory) {
    DataCategories.insert(field);
  },
  deleteField(field: DataCategory) {
    DataCategories.remove(field._id);
  },
};

Meteor.methods(serverMethods);