/// <reference path="../../typings/meteor-typescript-libs/meteor.d.ts" />

const FieldsFacade = {
  insert(field: DataCategory) {
    DataCategories.insert(field);
    ensureFullTextIndex();
  },
  deleteField(_id: string) {
    const field = DataCategories.findOne(_id);
    EntitiesFacade.removeFieldFromAllEntities(field);
    DataCategories.remove(_id);
    ensureFullTextIndex();
  }
};


this.FieldsFacade = FieldsFacade;