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

function createNameSelector(filterText: string, mode: QueryMode = QueryMode.NAME_PREFIX): Mongo.Selector {
  if (!filterText) {
    return {};
  }
  switch (mode) {
    case QueryMode.NAME_PREFIX:
      return {
        _lowercase_name: new RegExp('^' + escapeRegExp(filterText.toLowerCase()))
      };
    case QueryMode.NAME_REGEXP:
      return {
        name: new RegExp(filterText)
      };
    case QueryMode.FULL_TEXT:
      return {
        $text: {
          $search: filterText
        }
      };
    default:
      throw new Error('Unknown queryMode: ' + mode);
  }
}

function getDescendantPickListItems(pickList: PickListItem): PickListItem[] {
  if (!pickList) {
    return [];
  }
  return _.flatten(pickList.items.map(pickListItem => {
    return [pickListItem].concat(getDescendantPickListItems(pickListItem));
  }));
}

function getPickListItem(pickList: PickList, name: string, level = 0): PickListItem {
  if (!pickList) {
    return undefined;
  }
  if (level > 0 && pickList.name === name) {
    return pickList;
  }
  for (const pickListItem of pickList.items) {
    const childResult = getPickListItem(pickListItem, name, level + 1);
    if (childResult) {
      return childResult;
    }
  }
  return undefined;
}

function createMongoSelector(filters: EntityFilter[], pickLists: PickList[]): Mongo.Selector {
  if (!filters) {
    return {};
  }
  const selectorsToAnd = _.compact(filters.map(filter => {
    if (filter.values.length === 0) {
      return undefined;
    }
    const pickList = _.find(pickLists, pl => pl._id === filter.field.pickListId);
    return {
      [filter.field.name]: {
        $in: _.unique(_.flatten(filter.values.map(filterValue => {
          const pickListItem = getPickListItem(pickList, filterValue);
          if (!pickListItem) {
            return [];
          }
          return [pickListItem].concat(getDescendantPickListItems(pickListItem));
        })).map(plItem => plItem.name))
      }
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


function getRefInputElement(reactComponent: React.Component<any, any>, ref: string) {
  return reactComponent.refs[ref] as HTMLInputElement;
}


function getRefValue(reactComponent: React.Component<any, any>, ref: string) {
  const refElement = getRefInputElement(reactComponent, ref);
  if (!refElement) {
    return undefined;
  }
  return refElement.value;
}

function getCheckBoxRefValue(reactComponent: React.Component<any, any>, ref: string) {
  const refElement = getRefInputElement(reactComponent, ref);
  if (!refElement) {
    return undefined;
  }
  return refElement.checked;
}

function swap<T>(x: T, f: (x: T) => void) {
  const xClone = _.clone(x);
  f(xClone);
  return Object.freeze(xClone);
}

function localizeEntityType(type: string, number = 1) {
  const singularTypeName = type === ENTITY_TYPES.C ? 'concept' : 'term';
  return singularTypeName + (number === 1 ? '' : 's');
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
this.getDescendantPickListItems = getDescendantPickListItems;
this.getCheckBoxRefValue = getCheckBoxRefValue;
this.localizeEntityType = localizeEntityType;