Meteor.methods({
  createEntity(entity: Entity) {
    Entities.insert(entity);
  },

});