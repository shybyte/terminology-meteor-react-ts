/// <reference path="../../typings/meteor-typescript-libs/meteor.d.ts" />

interface MongoDBObject {
  _id?: string;
}

interface Entity extends MongoDBObject {
  name: string;
  _lowercase_name?: string;
  [key: string]: any;
}

interface DataCategory extends MongoDBObject {
  type: string; // FIELD_TYPES
  name: string;
  pickListId?: string;
}

const FIELD_TYPES = {
  TEXT: 'TEXT',
  PICK_LIST: 'PICK_LIST'
};

interface PickList extends MongoDBObject {
  name: string;
  items: PickListItem[];
}

interface PickListItem {
  name: string;
  items: PickListItem[];
}

const COLLECTIONS = {
  entities: 'entities',
  dataCategories: 'dataCategories',
  pickLists: 'pickLists'
};

const Entities = new Mongo.Collection<Entity>(COLLECTIONS.entities);
const DataCategories = new Mongo.Collection<DataCategory>(COLLECTIONS.dataCategories);
const PickLists = new Mongo.Collection<PickList>(COLLECTIONS.pickLists);


this.Entities = Entities;
this.DataCategories = DataCategories;
this.PickLists = PickLists;
this.COLLECTIONS = COLLECTIONS;
this.FIELD_TYPES = FIELD_TYPES;