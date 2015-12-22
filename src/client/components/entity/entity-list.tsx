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
}


class EntityListComponent extends MeteorDataComponent<{}, EntityListState, EntityListData> implements GetMeteorDataInterface<EntityListData> {
  getInitialState(): EntityListState {
    return {
      filterText: '',
      limit: 20,
    };
  }

  getMeteorData() {
    const s = this.state;
    return {
      dataCategories: DataCategories.find({}, {sort: {name: 1}}).fetch(),
      entities: Entities.find(createNameFilter(s.filterText), {sort: {name: 1}, limit: s.limit}).fetch()
    };
  }

  getActiveColumns() {
    return ['name', ...this.data.dataCategories.map(dc => dc.name)];
  }


  getFilterInputEl() {
    return this.refs['filter'] as HTMLInputElement;
  }

  onFilterChanged() {
    const filterText = this.getFilterInputEl().value.trim();
    this.setState({filterText});
    this.updateSubscription(filterText);
  }

  updateSubscription(filterText: string) {
    if (this.state.subscription) {
      this.state.subscription.stop();
    }
    const subscription = Meteor.subscribe('entities', {nameFilterText: filterText, limit: this.state.limit});
    this.setState({subscription});
  }

  componentDidMount() {
    this.getFilterInputEl().focus();
    this.updateSubscription(this.state.filterText);
  }

  render() {
    const onFilterChanged = () => this.onFilterChanged();
    const activeColumns = this.getActiveColumns();
    const columnWidth = 100 / activeColumns.length;
    const columnStyle = {
      width: columnWidth + '%'
    };
    return (
      <div>
        <input ref="filter" className="form-control entityNameFilter" value={this.state.filterText} onChange={onFilterChanged} onInput={onFilterChanged} placeholder="Filter for name..."/>
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