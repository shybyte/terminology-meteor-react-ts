interface ServerMethods {
  createEntity(entity: Entity): void;
  updateEntity(_id: string, entity: Entity): void;
  deleteEntity(_id: string): void;

  createField(field: DataCategory): void;
  deleteField(_id: string): void;

  updatePickListName(_id: string, newName: string): void;
  addPickListItemSister(pickListId: string, brotherItemId: string , newName: string): void;
  addPickListItemChild(pickListId: string, parentItemId: string , newName: string): void;
}