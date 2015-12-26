interface ServerMethods {
  createEntity(entity: Entity): void;
  updateEntity(_id: string, entity: Entity): void;
  createField(field: DataCategory): void;
  deleteField(field: DataCategory): void;
}