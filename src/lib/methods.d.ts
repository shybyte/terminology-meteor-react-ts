interface ServerMethods {
  createEntity(entity: Entity): void;
  updateEntity(_id: string, entity: Entity): void;
  deleteEntity(_id: string): void;
  createField(field: DataCategory): void;
  deleteField(field: DataCategory): void;
}