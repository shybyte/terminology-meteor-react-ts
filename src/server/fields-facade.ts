/// <reference path="../../typings/meteor-typescript-libs/meteor.d.ts" />

const FieldsFacade = {
  deleteField(_id: string) {
    const field = DataCategories.findOne(_id);
    EntitiesFacade.removeFieldFromAllEntities(field);
    DataCategories.remove(_id);
  }
};


this.FieldsFacade = FieldsFacade;