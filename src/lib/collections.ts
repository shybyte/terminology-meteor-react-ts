/// <reference path="../../typings/meteor-typescript-libs/meteor.d.ts" />

interface Entity {
  _id?: string;
  name: string;
  [key: string] : any;
}

interface DataCategory {
  _id?: string;
  name: string;
}

const Entities = new Mongo.Collection<Entity>("entities");
const DataCategories = new Mongo.Collection<DataCategory>("dataCategories");


this.Entities = Entities;
this.DataCategories = DataCategories;