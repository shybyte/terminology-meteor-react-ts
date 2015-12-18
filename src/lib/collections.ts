/// <reference path="../../typings/meteor-typescript-libs/meteor.d.ts" />

interface Task {
  _id: string
  text: string
}

var Tasks = new Mongo.Collection("tasks");

this.Tasks = Tasks