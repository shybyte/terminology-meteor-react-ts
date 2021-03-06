/// <reference path="../../../../typings/react/react-global.d.ts" />
/// <reference path="../../../../typings/meteor-hacks.d.ts" />
/// <reference path="../../../../typings/meteor-typescript-libs/jquery.d.ts" />
'use strict';


interface EntityListProps {
  type: string; // ENTITY_TYPES
}

interface EntityListData {
  dataCategories: DataCategory[];
  entities: EntitySearchResult[];
  entitiesCountComplete: number;
  isLoadedUntilLimit: boolean;
  pickLists: PickList[];
}

interface EntityListState {
  filterText?: string;
  queryMode?: QueryMode;
  limit?: number;
  filters?: EntityFilter[];
  activeColumns?: string[];
}

const FILTER_KEY = 'filter';
const ACTIVE_COLUMNS_KEY = 'activeColumns';
const DEFAULT_LIMIT_INCREASE = 20;
const DEFAULT_LIMIT = DEFAULT_LIMIT_INCREASE;

const lastChachedSearchEntries: {[key: string]: EntitySearchResult[]} = {};

class EntityListComponent extends MeteorDataComponent<EntityListProps, EntityListState, EntityListData> implements GetMeteorDataInterface<EntityListData> {
  showMoreResultsIfNeededTimer: number;

  getInitialState(): EntityListState {
    return {
      filterText: '',
      queryMode: QueryMode.NAME_PREFIX,
      limit: DEFAULT_LIMIT,
      filters: [],
      activeColumns: ['name']
    };
  }

  getMeteorData() {
    const s = this.state;

    const pickLists = PickLists.find({}, {sort: {name: 1}}).fetch();

    const meaningfulFilters = keepMeaningfulFilters(this.fixFilter(s.filters), this.props.type);
    const sanitizedFilters = _.compact(meaningfulFilters.map(f => {
      if (f.field.type === FIELD_TYPES.PICK_LIST) {
        const pickList = _.find(pickLists, pl => pl._id === f.field.pickListId);
        if (pickList) {
          return swap(f, f2 => {
            f2.values = _.intersection(f.values, getDescendantPickListItems(pickList).map(pi => pi.name));
          });
        } else {
          return null;
        }
      } else {
        return f;
      }
    }));

    const props: EntitySearchProps = {
      queryMode: s.queryMode,
      fieldFilters: sanitizedFilters,
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
    const entities = isLoadedUntilLimit ? newFetchedEntities : (this.data.entities || lastChachedSearchEntries[this.props.type] || []);

    lastChachedSearchEntries[this.props.type] = entities;

    return {
      dataCategories: DataCategories.find({}, {sort: {name: 1}}).fetch(),
      entities,
      entitiesCountComplete,
      isLoadedUntilLimit,
      pickLists
    };
  }

  getPossibleColumns(): string[] {
    const type = this.props.type;
    const forwardFieldNames = this.data.dataCategories.filter(dc => (type === ENTITY_TYPES.T && !dc.inherit) || _.contains(dc.entityTypes, type)).map(dc => dc.name);
    const backWardFieldNames = this.data.dataCategories.filter(dc => type === ENTITY_TYPES.T || _.contains(dc.targetEntityTypes, type)).map(dc => dc.backwardName);
    const fieldColumns = forwardFieldNames.concat(backWardFieldNames).filter(_.isString);
    const isFullTextQuery = this.state.queryMode === QueryMode.FULL_TEXT;
    return ['name'].concat(isFullTextQuery ? ['score'] : []).concat(_.sortBy(fieldColumns));
  }


  getActiveColumns() {
    const meaningFullActiveColumns = _.intersection(this.state.activeColumns, this.getPossibleColumns());
    // Sort name always first
    return _.sortBy(meaningFullActiveColumns, columnName => columnName === 'name' ? '' : columnName);
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
    $(window).scroll(this.showMoreResultsIfNeeded);
    this.showMoreResultsIfNeededTimer = setInterval(() => {
      this.showMoreResultsIfNeeded();
    }, 1000);

    // We want to prevent closing of the dopdown and at the same time we need to get the values.
    const self = this;
    $("ul.dropdown-menu").on("click", "label", function (e) {
      self.onClickColumnSelectorItem(this, e);
    });
  }

  onClickColumnSelectorItem(label: HTMLInputElement, e: Event) {
    e.stopPropagation();
    const checkbox = $('input', label).get(0) as HTMLInputElement;
    const columnName = checkbox.value;
    this.setState({
      activeColumns: _.uniq(checkbox.checked ? this.getActiveColumns().concat(columnName) : _.without(this.getActiveColumns(), columnName))
    });
  }


  componentWillUnmount() {
    $(window).off('scroll', this.showMoreResultsIfNeeded);
    clearInterval(this.showMoreResultsIfNeededTimer);
  }

  addFilter(filter: EntityFilter) {
    this.setState({
      filters: this.state.filters.concat(filter),
      limit: DEFAULT_LIMIT
    });
  }

  loadActiveColumns(entityType: string) {
    return JSON.parse(localStorage.getItem(ACTIVE_COLUMNS_KEY + entityType) || '["name"]');
  }


  componentWillUpdate(newProps: EntityListProps, newState: EntityListState) {
    if (this.state.filters !== newState.filters) {
      this.saveFilter(newState.filters);
    }
    if (!_.isEqual(this.state.activeColumns, newState.activeColumns)) {
      localStorage.setItem(ACTIVE_COLUMNS_KEY + this.props.type, JSON.stringify(newState.activeColumns));
    }
    if (newProps.type !== this.props.type) {
      this.setState({
        limit: DEFAULT_LIMIT,
        activeColumns: this.loadActiveColumns(newProps.type)
      });
    }
  }

  componentDidUpdate() {
    this.showMoreResultsIfNeeded();
  }

  fixFilter(filters: EntityFilter[]) {
    return _.compact(filters.map(filter => {
      const field = DataCategories.findOne({name: filter.field.name});
      if (!field) {
        return undefined;
      }
      return swap(filter, lf => {
        lf.field = field;
      });
    }));
  }

  componentWillMount() {
    const loadedFilters: EntityFilter[] = JSON.parse(localStorage.getItem(FILTER_KEY) || '[]');
    this.setState({
      filters: this.fixFilter(loadedFilters),
      activeColumns: this.loadActiveColumns(this.props.type)
    });
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

  showMoreResultsIfNeeded() {
    const target = $(this.refs['showMoreResults']);
    if (!target.length) {
      return;
    }

    const threshold = $(window).scrollTop() + $(window).height() * 1.5 - target.height();
    if (target.offset().top < threshold && this.data.isLoadedUntilLimit) {
      console.log('Showmore');
      this.setState({
        limit: this.state.limit + DEFAULT_LIMIT_INCREASE
      });
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

          <FilterBar filters={this.fixFilter(s.filters)} addFilter={this.addFilter} changeFilter={this.changeFilter}
                     removeFilter={this.removeFilter} entityType={type}/>

          {this.renderColumnSelector()}

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
            <col></col>
            {activeColumns.map(ac => <col key={ac} span={1} style={columnStyle}/>)}
          </colgroup>
          <thead>
            <tr>
              <th></th>
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

  renderColumnSelector() {
    return (
      <div className="btn-group">
        <button type="button" className="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true"
                aria-expanded="false">
          <span className="glyphicon glyphicon-list" title="Select Columns"></span>
          Columns
        </button>
        <ul className="dropdown-menu dropdown-menu-right columnSelector">
          {this.getPossibleColumns().map(this.renderColumnSelectorItem)}
        </ul>
      </div>
    );
  }

  renderColumnSelectorItem(columnName: string) {
    return <li key={columnName}>
      <div className="checkbox">
        <label>
          <input type="checkbox" value={columnName} checked={_.contains(this.state.activeColumns, columnName)}
                 onChange={_.noop}/>
          {toDisplayName(columnName)}
        </label>
      </div>
    </li>;
  }

  renderTableHeader() {
    return this.getActiveColumns().map(col =>
      <th key={col}>
        {toDisplayName(col)}
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
      <EntityRow key={entity.__originalId} entity={entity} activeColumns={this.getActiveColumns()}
                 fields={this.data.dataCategories}/>
    );
  }
}


const EntityList = mixinReactMeteorData(EntityListComponent);

this.EntityList = EntityList;