/// <reference path="../../../../typings/react/react-global.d.ts" />
/// <reference path="../../../../typings/meteor-hacks.d.ts" />
/// <reference path="../../../../typings/meteor-typescript-libs/jquery.d.ts" />

interface EntityListProps {
  type: string; // ENTITY_TYPES
}

interface EntityListData {
  dataCategories: DataCategory[];
  entities: EntitySearchResult[];
  entitiesCountComplete: number;
}

interface EntityListState {
  filterText?: string;
  queryMode?: QueryMode;
  limit?: number;
  filters?: EntityFilter[];
}

const FILTER_KEY = 'filter';
const DEFAULT_LIMIT = 10;
const DEFAULT_LIMIT_INCREASE = 10;

class EntityListComponent extends MeteorDataComponent<EntityListProps, EntityListState, EntityListData> implements GetMeteorDataInterface<EntityListData> {

  getInitialState(): EntityListState {
    return {
      filterText: '',
      queryMode: QueryMode.NAME_PREFIX,
      limit: DEFAULT_LIMIT,
      filters: []
    };
  }

  getMeteorData() {
    const s = this.state;

    const props: EntitySearchProps = {
      queryMode: s.queryMode,
      fieldFilters: s.filters,
      type: this.props.type,
    };

    const entityIndexCursor = EntitiesIndex.search(
      this.state.filterText, {
        limit: s.limit,
        props
      });

    const entitiesCountComplete = entityIndexCursor.count();
    const newFetchedEntities = entityIndexCursor.fetch();
    const isLoadedUntilLimit = entityIndexCursor.isReady() &&
      (entitiesCountComplete === newFetchedEntities.length || newFetchedEntities.length === s.limit);

    // Display old data if new has not completely arrived, in order to avoid flickering/scroll jumping
    const entities = isLoadedUntilLimit ? newFetchedEntities : (this.data.entities || []);

    return {
      dataCategories: DataCategories.find({}, {sort: {name: 1}}).fetch(),
      entities,
      entitiesCountComplete,
    };
  }

  getActiveColumns() {
    const type = this.props.type;
    const forwardFieldNames = this.data.dataCategories.filter(dc => type === ENTITY_TYPES.T || _.contains(dc.entityTypes, type)).map(dc => dc.name);
    const backWardFieldNames = this.data.dataCategories.filter(dc => type === ENTITY_TYPES.T || _.contains(dc.targetEntityTypes, type)).map(dc => dc.backwardName);
    const fieldColumns = forwardFieldNames.concat(backWardFieldNames).filter(_.isString);
    return ['name'].concat(_.sortBy(fieldColumns));
  }


  getFilterInputEl() {
    return this.refs['filter'] as HTMLInputElement;
  }

  onNameFilterChanged() {
    const filterText = this.getFilterInputEl().value;
    this.setState({filterText, limit: DEFAULT_LIMIT});
  }

  onChangeQueryMode(option: ReactSelectOption) {
    this.setState({
      queryMode: parseInt(option.value),
      limit: DEFAULT_LIMIT
    });
  }

  componentDidMount() {
    this.getFilterInputEl().focus();
    $(window).scroll(this.onScroll);
  }

  componentWillUnmount() {
    $(window).off('scroll', this.onScroll);
  }

  addFilter(filter: EntityFilter) {
    this.setState({
      filters: this.state.filters.concat(filter),
      limit: DEFAULT_LIMIT
    });
  }


  componentWillUpdate(newProps: EntityListProps, newState: EntityListState) {
    if (this.state.filters !== newState.filters) {
      this.saveFilter(newState.filters);
    }
    if (newProps.type !== this.props.type) {
      this.setState({
        limit: DEFAULT_LIMIT
      });
    }
  }

  componentWillMount() {
    const loadedFilters: EntityFilter[] = JSON.parse(localStorage.getItem(FILTER_KEY) || '[]');
    const fixedFilters = _.compact(loadedFilters.map(loadedFilter => {
      const field = DataCategories.findOne({name: loadedFilter.field.name});
      if (!field) {
        return undefined;
      }
      return swap(loadedFilter, lf => {
        lf.field = field;
      });
    }));
    this.setState({filters: fixedFilters});
  }

  changeFilter(changedFilter: EntityFilter) {
    this.setState({
      filters: this.state.filters.map(filter => {
        return (filter.id === changedFilter.id) ? changedFilter : filter;
      }),
      limit: DEFAULT_LIMIT
    });
  }

  saveFilter(filters: EntityFilter[]) {
    localStorage.setItem(FILTER_KEY, JSON.stringify(filters));
  }

  removeFilter(filterToRemove: EntityFilter) {
    this.setState({
      filters: this.state.filters.filter(filter => filter.id !== filterToRemove.id),
      limit: DEFAULT_LIMIT
    });
  }

  onScroll() {
    const target = $(this.refs['showMoreResults']);
    if (!target.length) {
      return;
    }

    const threshold = $(window).scrollTop() + $(window).height() * 1.5 - target.height();

    if (target.offset().top < threshold) {
      if (!target.data("visible")) {
        target.data("visible", true);
        this.setState({
          limit: this.state.limit + DEFAULT_LIMIT_INCREASE
        });
      }
    } else {
      if (target.data("visible")) {
        target.data("visible", false);
      }
    }
  }

  render() {
    const s = this.state;
    const onNameFilterChanged = () => this.onNameFilterChanged();
    const activeColumns = this.getActiveColumns();
    const columnWidth = 100 / activeColumns.length;
    const columnStyle = {
      width: columnWidth + '%'
    };
    const queryModeOptions: ReactSelectOption[] = [{
      value: String(QueryMode.NAME_PREFIX),
      label: 'Name Prefix'
    }, {
      value: String(QueryMode.NAME_REGEXP),
      label: 'Name RegExp'
    }, {
      value: String(QueryMode.FULL_TEXT),
      label: 'Full Text'
    }];

    const {entitiesCountComplete} = this.data;
    const entitiesCountDisplayed = this.data.entities.length;
    const hasMoreResults = entitiesCountComplete > entitiesCountDisplayed;
    const {type} = this.props;

    return (
      <div className="entityList">
        <div className="flexRow">
          <input ref="filter" className="form-control entityNameFilter" value={this.state.filterText}
                 onChange={_.noop} onInput={onNameFilterChanged} placeholder="Filter for ..."/>

          <Select
            name="queryMode"
            className="queryMode"
            clearable={false}
            value={String(s.queryMode)}
            options={queryModeOptions}
            onChange={this.onChangeQueryMode}
          />

          <FilterBar filters={s.filters} addFilter={this.addFilter} changeFilter={this.changeFilter}
                     removeFilter={this.removeFilter}/>
        </div>
        <div className="resultCounts">
          Found &nbsp;
          <strong>{entitiesCountComplete}</strong>
          &nbsp;
                   {localizeEntityType(type, entitiesCountComplete)}.&nbsp;
          <strong>{entitiesCountDisplayed}</strong>&nbsp;
          {localizeEntityType(type, entitiesCountDisplayed)} displayed.
        </div>
        <table className="table">
          <colgroup>
            {activeColumns.map(ac => <col key={ac} span={1} style={columnStyle}/>)}
          </colgroup>
          <thead>
            <tr>
              {this.renderTableHeader()}
            </tr>
          </thead>
          <tbody>
            {this.renderEntities()}
          </tbody>
        </table>

        {hasMoreResults ? this.renderShowMoreResults() : ''}

      </div>
    );
  }

  renderTableHeader() {
    return this.getActiveColumns().map(col =>
      <th key={col}>
        {col}
      </th>
    );
  }

  renderShowMoreResults() {
    return (
      <div className="showMoreResults" ref="showMoreResults">
        <span className="loading">Loading...</span>
      </div>
    );
  }

  renderEntities() {
    return this.data.entities.map(entity =>
      <EntityRow key={entity._id} entity={entity} activeColumns={this.getActiveColumns()}
                 fields={this.data.dataCategories}/>
    );
  }
}


const EntityList = mixinReactMeteorData(EntityListComponent);

this.EntityList = EntityList;