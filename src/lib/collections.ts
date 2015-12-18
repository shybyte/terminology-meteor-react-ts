/// <reference path="../../typings/meteor-typescript-libs/meteor.d.ts" />

interface Entity {
  _id?: string
  name: string
}

var Entities = new Mongo.Collection<Entity>("entities");

this.Entities = Entities;