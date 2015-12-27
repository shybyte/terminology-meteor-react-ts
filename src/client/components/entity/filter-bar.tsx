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
    const pickListFields = this.data.fields.filter(f => f.type === FIELD_TYPES.PICK_LIST);
    return <div className="filterBar">
      {this.props.filters.map((filter,i) => <FilterBarItem key={i + ''} filter={filter}
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
      <a href="#" onClick={ev => this.onClickMenuItem(ev,field)}>{field.name}</a>
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
      <label>{field.name}</label>
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


const FilterBar = mixinReactMeteorData(FilterBarComponent);
this.FilterBar = FilterBar;