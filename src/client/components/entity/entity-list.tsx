/// <reference path="../../../../typings/react/react-global.d.ts" />
/// <reference path="../../../../typings/meteor-hacks.d.ts" />

interface EntityListData {
  dataCategories: DataCategory[];
  entities: Entity[];
}

interface EntityListState {
  filterText?: string;
  subscription?: Meteor.SubscriptionHandle;
  limit?: number;
  filters?: EntityFilter[];
}

const FILTER_KEY = 'filter';

class EntityListComponent extends MeteorDataComponent<{}, EntityListState, EntityListData> implements GetMeteorDataInterface<EntityListData> {
  getInitialState(): EntityListState {
    return {
      filterText: '',
      limit: 20,
      filters: []
    };
  }

  getMeteorData() {
    const s = this.state;
    return {
      dataCategories: DataCategories.find({}, {sort: {name: 1}}).fetch(),
      entities: Entities.find(assign(createNameSelector(s.filterText), createMongoSelector(s.filters)), {sort: {_lowercase_name: 1}, limit: s.limit}).fetch()
    };
  }

  getActiveColumns() {
    const fieldColumns = this.data.dataCategories.map(dc => dc.name).concat(this.data.dataCategories.map(dc => dc.backwardName)).filter(_.isString);
    return ['name'].concat(_.sortBy(fieldColumns));
  }


  getFilterInputEl() {
    return this.refs['filter'] as HTMLInputElement;
  }

  onNameFilterChanged() {
    const filterText = this.getFilterInputEl().value.trim();
    this.setState({filterText});
    this.updateSubscription(filterText, this.state.filters);
  }

  updateSubscription(filterText: string, filters: EntityFilter[]) {
    if (this.state.subscription) {
      this.state.subscription.stop();
    }
    const subscription = Meteor.subscribe(PUBLICATIONS.entities, {
      nameFilterText: filterText,
      fieldFilters: filters,
      limit: this.state.limit
    });
    this.setState({subscription});
  }

  componentDidMount() {
    this.getFilterInputEl().focus();
    this.updateSubscription(this.state.filterText, this.state.filters);
  }

  addFilter(filter: EntityFilter) {
    this.setState({
      filters: this.state.filters.concat(filter)
    });
  }

  onFilterChanged(newFilter: EntityFilter[]) {
    this.updateSubscription(this.state.filterText, newFilter);
  }

  componentWillUpdate(props: {}, newState: EntityListState) {
    if (this.state.filters !== newState.filters) {
      this.saveFilter(newState.filters);
      this.onFilterChanged(newState.filters);
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
    return (
      <div>
        <div className="flexRow">
          <input ref="filter" className="form-control entityNameFilter" value={this.state.filterText}
                 onChange={onNameFilterChanged} onInput={onNameFilterChanged} placeholder="Filter for name..."/>
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
      <EntityRow key={entity._id} entity={entity} activeColumns={this.getActiveColumns()}/>
    );
  }
}


const EntityList = mixinReactMeteorData(EntityListComponent);

this.EntityList = EntityList;