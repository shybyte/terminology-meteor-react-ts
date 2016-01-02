/// <reference path="../../typings/meteor-typescript-libs/meteor.d.ts" />

interface MongoDBObject {
  _id?: string;
}

interface MiniEntity extends MongoDBObject {
  name: string;
}

interface EntityUpdate extends MongoDBObject {
  name?: string;
  type?: string;
  _lowercase_name?: string;
  [key: string]: string | string[] | MiniEntity[];
}

interface EntityInsert extends EntityUpdate {
  name: string;
  type: string;
  [key: string]: string | string[] | MiniEntity[];
}

interface Entity extends EntityInsert {
  _id: string;
  type: string;
  name: string;
  _lowercase_name: string;
  [key: string]: string | string[] | MiniEntity[];
}

const ENTITY_TYPES = {
  C: 'C', // Concept
  T: 'T'  // Term
};


interface DataCategory extends MongoDBObject {
  type: string; // FIELD_TYPES
  multi: boolean;
  name: string;
  entityTypes: string[];
  targetEntityTypes?: string[];
  backwardName?: string;  // used for references
  backwardMulti?: boolean;
  pickListId?: string;
}

const FIELD_TYPES = {
  TEXT: 'TEXT',
  PICK_LIST: 'PICK_LIST',
  REFERENCE: 'REFERENCE'
};

interface PickList extends MongoDBObject {
  name: string;
  items: PickListItem[];
}

interface PickListItem {
  name: string;
  items: PickListItem[];
}


const TERMS_REFERENCE = Object.freeze({
  name: 'terms',
  entityTypes: [ENTITY_TYPES.C],
  targetEntityTypes: [ENTITY_TYPES.T],
  multi: true,
  backwardMulti: false,
  type: FIELD_TYPES.REFERENCE,
  backwardName: 'concept'
});

const COLLECTIONS = {
  entities: 'entities',
  dataCategories: 'dataCategories',
  pickLists: 'pickLists'
};

const PUBLICATIONS = assign(COLLECTIONS, {
  entity: 'entity',
  miniEntities: 'miniEntities',
});

const Entities = new Mongo.Collection<Entity>(COLLECTIONS.entities);
const DataCategories = new Mongo.Collection<DataCategory>(COLLECTIONS.dataCategories);
const PickLists = new Mongo.Collection<PickList>(COLLECTIONS.pickLists);

function minifyEntity(e: {_id: string, name: string}): MiniEntity {
  return {_id: e._id, name: e.name};
}

this.Entities = Entities;
this.DataCategories = DataCategories;
this.PickLists = PickLists;
this.COLLECTIONS = COLLECTIONS;
this.PUBLICATIONS = PUBLICATIONS;
this.FIELD_TYPES = FIELD_TYPES;
this.ENTITY_TYPES = ENTITY_TYPES;
this.minifyEntity = minifyEntity;
this.TERMS_REFERENCE = TERMS_REFERENCE;