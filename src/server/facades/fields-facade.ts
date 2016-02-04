/// <reference path="../../../typings/meteor-typescript-libs/meteor.d.ts" />


function ensureFieldIndex(field: DataCategory) {
  switch (field.type) {
    case FIELD_TYPES.TEXT:
      ensureFullTextIndex();
      break;
    case FIELD_TYPES.PICK_LIST:
      Entities._ensureIndex({[field.name]: 1});
      break;
    case FIELD_TYPES.REFERENCE:
      Entities._ensureIndex({[field.name + '._id']: 1});
      if (field.backwardName) {
        Entities._ensureIndex({[field.backwardName + '._id']: 1});
      }
      break;
    default:
      console.error('Unknown field type:  ', field);
      throw new Error('Unknown field type: ' + field.type);
  }
}


const FieldsFacade = {
  insert(field: DataCategory) {
    DataCategories.insert(field.type === FIELD_TYPES.REFERENCE ?
      assign(field, { backwardMulti: true}) :
      field
    );
    ensureFieldIndex(field);
  },
  deleteField(_id: string) {
    const field = DataCategories.findOne(_id);
    EntitiesFacade.removeFieldFromAllEntities(field);
    DataCategories.remove(_id);
    if (field.type === FIELD_TYPES.TEXT) {
      ensureFullTextIndex();
    }
  }
};


this.FieldsFacade = FieldsFacade;