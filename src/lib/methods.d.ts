interface ServerMethods {
  createEntity(entity: Entity): void;
  saveEntity(entity: Entity): void;
  createField(field: DataCategory): void;
  deleteField(field: DataCategory): void;
}