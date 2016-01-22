declare const ReactMeteorData: any;
declare const lodash: _.LoDashStatic;
declare const ReactLayout: any;
declare const EasySearch: any;

declare namespace Mongo {
  interface Collection<T> {
    _ensureIndex(fields: {[key: string]: any}, options?: {[key: string]: any}): void;
    _dropIndex(name: string): void;
  }
}