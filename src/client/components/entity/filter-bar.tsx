/// <reference path="../../../../typings/react/react-global.d.ts" />


interface FilterBarData {
  pickLists: PickList[];
  fields: DataCategory[];
}

interface EntityFilter {
  id: string;
  field: DataCategory;
  values: string[];
}

interface FilterBarProps {
  entityType: string;
  filters: EntityFilter[];
  addFilter(filter: EntityFilter): void;
  changeFilter(filter: EntityFilter): void;
  removeFilter(filter: EntityFilter): void;
}

class FilterBarComponent extends MeteorDataComponent<FilterBarProps, {}, FilterBarData> implements GetMeteorDataInterface<FilterBarData> {
  getMeteorData() {
    return {
      pickLists: PickLists.find({}).fetch(),
      fields: DataCategories.find({}, {sort: {name: 1}}).fetch()
    };
  }

  onClickMenuItem(ev: React.SyntheticEvent, field: DataCategory) {
    ev.preventDefault();
    console.log(field);
    this.props.addFilter({
      id: _.uniqueId(Date.now() + '-'),
      field,
      values: []
    });
  }

  onFilterChanged(filter: EntityFilter) {
    console.log('onFilterChanged', filter);
    this.props.changeFilter(filter);
  }


  render() {
    const entityType = this.props.entityType;
    const pickListFields = this.data.fields.filter(f => hasFilterableField(entityType, f));
    const activeFilters = keepMeaningfulFilters(this.props.filters, entityType);
    return <div className="filterBar">
      {activeFilters.map((filter,i) => <FilterBarItem key={i + ''} filter={filter}
                                                      pickLists={this.data.pickLists}
                                                      changeFilter={this.onFilterChanged}
                                                      removeFilter={this.props.removeFilter}/>)}

      <div className="btn-group">
        <button type="button" className="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true"
                aria-expanded="false">
          <span className="glyphicon glyphicon-plus" title="Add Filter"></span>
          Filter
        </button>
        <ul className="dropdown-menu dropdown-menu-right">
          {pickListFields.map(this.renderMenuItem)}
        </ul>
      </div>
    </div>;
  }

  renderMenuItem(field: DataCategory) {
    return <li key={field.name}>
      <a href="#" onClick={ev => this.onClickMenuItem(ev,field)}>{toDisplayName(field.name)}</a>
    </li>;
  }
}


interface FilterBarItemProps {
  key: string;
  filter: EntityFilter;
  changeFilter(filter: EntityFilter): void;
  removeFilter(filter: EntityFilter): void;
  pickLists: PickList[];
}

class FilterBarItem extends React.Component<FilterBarItemProps, {}> {
  onChangePickListItem = (options: PickListSelectOption[]) => {
    const p = this.props;
    if (options === null) {
      p.removeFilter(this.props.filter);
      return;
    }
    p.changeFilter(swap(p.filter, filter => {
      filter.values = options.map(o => o.value);
    }));
  };

  render() {
    const p = this.props;
    const field = p.filter.field;
    const pickList = _.find(p.pickLists, {_id: field.pickListId});
    if (!pickList) {
      return <div className="filterBarItem">Loading...</div>;
    }
    const options = createSelectOptionsFromPickList(pickList);
    return <div className="filterBarItem">
      <label>{toDisplayName(field.name)}</label>
      <Select
        name={field.name}
        multi={true}
        value={p.filter.values}
        options={options}
        optionRenderer={renderPickListItem}
        onChange={this.onChangePickListItem}
      />
    </div>;
  }
}

function hasFilterableField(entityType: string, field: DataCategory) {
  return field.type === FIELD_TYPES.PICK_LIST && (entityType === ENTITY_TYPES.T || _.contains(field.entityTypes, entityType));
}

function keepMeaningfulFilters(filters: EntityFilter[], entityType: string) {
  return filters.filter(f => hasFilterableField(entityType, f.field));
}

const FilterBar = mixinReactMeteorData(FilterBarComponent);
this.FilterBar = FilterBar;
this.keepMeaningfulFilters = keepMeaningfulFilters;