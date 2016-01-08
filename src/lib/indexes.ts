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
  engine: new EasySearch.MongoTextIndex({
    sort: () => ['_lowercase_name'],
    selector: function (searchQuery: string, options: SearchEntitiesOptions) {
      const searchProps = options.search.props;
      const mongoNameSelector = createNameSelector(searchQuery, searchProps.queryMode);
      const pickLists = PickLists.find({}).fetch();
      const mongoFieldSelector = createMongoSelector(searchProps.fieldFilters, pickLists);
      const mongoSelector = _.assign({}, mongoNameSelector, mongoFieldSelector, {type: searchProps.type});
      return mongoSelector;
    }
  })
});


this.EntitiesIndex = EntitiesIndex;
this.QueryMode = QueryMode;