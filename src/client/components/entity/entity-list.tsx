/// <reference path="../../../../typings/react/react-global.d.ts" />
/// <reference path="../../../../typings/meteor-hacks.d.ts" />

interface EntityListProps {
  type: string; // ENTITY_TYPES
}

interface EntityListData {
  dataCategories: DataCategory[];
  entities: EntitySearchResult[];
}

interface EntityListState {
  filterText?: string;
  queryMode?: QueryMode;
  limit?: number;
  filters?: EntityFilter[];
}

const FILTER_KEY = 'filter';

class EntityListComponent extends MeteorDataComponent<EntityListProps, EntityListState, EntityListData> implements GetMeteorDataInterface<EntityListData> {
  getInitialState(): EntityListState {
    return {
      filterText: '',
      queryMode: QueryMode.NAME_PREFIX,
      limit: 10,
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
    return {
      dataCategories: DataCategories.find({}, {sort: {name: 1}}).fetch(),
      entities: entityIndexCursor.fetch()
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
    this.setState({filterText});
  }

  onChangeQueryMode(option: ReactSelectOption) {
    this.setState({
      queryMode: parseInt(option.value)
    });
  }

  componentDidMount() {
    this.getFilterInputEl().focus();
  }

  addFilter(filter: EntityFilter) {
    this.setState({
      filters: this.state.filters.concat(filter)
    });
  }

  componentWillUpdate(newProps: EntityListProps, newState: EntityListState) {
    if (this.state.filters !== newState.filters) {
      this.saveFilter(newState.filters);
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
      })
    });
  }

  saveFilter(filters: EntityFilter[]) {
    localStorage.setItem(FILTER_KEY, JSON.stringify(filters));
  }

  removeFilter(filterToRemove: EntityFilter) {
    this.setState({
      filters: this.state.filters.filter(filter => filter.id !== filterToRemove.id)
    });
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

  renderEntities() {
    return this.data.entities.map(entity =>
      <EntityRow key={entity._id} entity={entity} activeColumns={this.getActiveColumns()}
                 fields={this.data.dataCategories}/>
    );
  }
}


const EntityList = mixinReactMeteorData(EntityListComponent);

this.EntityList = EntityList;