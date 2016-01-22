enum QueryMode {
  NAME_PREFIX, NAME_REGEXP, FULL_TEXT
}

interface EntitySearchProps {
  queryMode: QueryMode;
  fieldFilters: EntityFilter[];
  type: string;
}


interface SearchEntitiesOptions {
  search: {
    props: EntitySearchProps;
  };
}

const EntitiesIndex = new EasySearch.Index({
  collection: Entities,
  fields: ['name', 'description', 'notes'],
  weights: {
    name: 2,
    description: 1,
    notes: 1
  },
  engine: new EasySearch.MongoTextIndex({
    sort (searchQuery: string, options: SearchEntitiesOptions): any {
      const searchProps = options.search.props;
      if (searchProps.queryMode === QueryMode.FULL_TEXT) {
        return {score: {$meta: "textScore"}};
      } else {
        return ['_lowercase_name'];
      }
    },

    fields (searchQuery: string, options: SearchEntitiesOptions) {
      const isFullText =  options.search.props.queryMode === QueryMode.FULL_TEXT;
      return isFullText ? {score: {$meta: "textScore"}} : {};
    },

    selector (searchQuery: string, options: SearchEntitiesOptions) {
      const searchProps = options.search.props;
      const mongoNameSelector = createNameSelector(searchQuery, searchProps.queryMode);
      const pickLists = PickLists.find({}).fetch();
      const mongoFieldSelector = createMongoSelector(searchProps.fieldFilters, pickLists);
      return _.assign({}, mongoNameSelector, mongoFieldSelector, {type: searchProps.type});
    }
  })
});


this.EntitiesIndex = EntitiesIndex;
this.QueryMode = QueryMode;