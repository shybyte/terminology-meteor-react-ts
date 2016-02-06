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
    assertNotEmpty(field.name, 'field.name');
    DataCategories.insert(field.type === FIELD_TYPES.REFERENCE ?
      assign(field, {backwardMulti: true}) :
      field
    );
    ensureFieldIndex(field);
  },

  deleteField(_id: string) {
    const field = DataCategories.findOne(_id);

    try {
      switch (field.type) {
        case FIELD_TYPES.TEXT:
          ensureFullTextIndex();
          break;
        case FIELD_TYPES.PICK_LIST:
          Entities._dropIndex(field.name + '_1');
          break;
        case FIELD_TYPES.REFERENCE:
          Entities._dropIndex(field.name + '._id_1');
          if (field.backwardName) {
            Entities._dropIndex(field.backwardName + '._id_1');
          }
          break;
        default:
          console.error('Unknown field type:  ', field);
          throw new Error('Unknown field type: ' + field.type);
      }
    } catch (error) {
      console.error(error);
    }

    EntitiesFacade.removeFieldFromAllEntities(field);
    DataCategories.remove(_id);
  }
};


this.FieldsFacade = FieldsFacade;