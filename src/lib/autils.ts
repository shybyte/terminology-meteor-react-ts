/// <reference path="../../typings/lodash.d.ts" />

/**
 * This file starts with "a" in order to be loaded by meteor first.
 */

_ = lodash;

function assign<T1, T2>(t1: T1, t2: T2): T1 & T2 {
  return _.assign({} as T1, t1, t2) as (T1 & T2);
}

function mixinReactMixin<P>(reactComponentClass: {prototype: React.Component<P, any>}, ...mixins: any[]): React.ClassicComponentClass<P> {
  return React.createClass<P, any>(assign(reactComponentClass.prototype, {mixins}) as any);
}

function mixinReactMeteorData<P>(reactClass: {prototype: React.Component<P, any>}): React.ClassicComponentClass<P> {
  return mixinReactMixin(reactClass, ReactMeteorData);
}

interface GetMeteorDataInterface<D> {
  getMeteorData(): D;
  data: D;
}

class MeteorDataComponent<P, S, D> extends React.Component<P, S> {
  data: D;
}

function escapeRegExp(str: string) {
  return str.replace(/[\-\[\]\/\{}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

function createNameSelector(filterText: string): Mongo.Selector {
  if (!filterText) {
    return {};
  }
  const filterRegexp = new RegExp('^' + escapeRegExp(filterText.toLowerCase()));
  return {
    _lowercase_name: filterRegexp
  };
}

function createMongoSelector(filters?: EntityFilter[]): Mongo.Selector {
  if (!filters) {
    return {};
  }
  const selectorsToAnd = _.compact(filters.map(filter => {
    if (filter.values.length === 0) {
      return undefined;
    }
    return {
      [filter.field.name]: {$in: filter.values}
    };
  }));
  if (selectorsToAnd.length === 0) {
    return {};
  }
  return {$and: selectorsToAnd};
}

function isEmpty(s: string) {
  return !s || s.trim() === '';
}

function getRefValue(reactCompponent: React.Component<any, any>, ref: string) {
  const refElement = reactCompponent.refs[ref];
  if (!refElement) {
    return undefined;
  }
  return (refElement as HTMLInputElement).value;
}

function swap<T>(x: T, f: (x: T) => void) {
  const xClone = _.clone(x);
  f(xClone);
  return Object.freeze(xClone);
}

this.MeteorDataComponent = MeteorDataComponent;
this.mixinReactMeteorData = mixinReactMeteorData;
this.createNameSelector = createNameSelector;
this.assign = assign;
this.isEmpty = isEmpty;
this._ = _;
this.getRefValue = getRefValue;
this.swap = swap;
this.createMongoSelector = createMongoSelector;