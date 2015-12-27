/// <reference path="../../../../typings/react/react-global.d.ts" />
/// <reference path="../../../../typings/meteor-hacks.d.ts" />
/// <reference path="../../../../typings/react-select.d.ts" />

interface EntityCreateEditComponentProps {
  entity: Entity;
}

interface EntityCreateEditData {
  dataCategories: DataCategory[];
}

interface EntityCreateEditState {
  successMessage?: boolean;
  errorMessage?: string;
  modifiedFieldValues?: Entity;
}

interface MiniEntitySelectOption {
  label: string;
  value: string;
  entity: MiniEntity;
}

class EntityCreateEditComponent extends MeteorDataComponent<EntityCreateEditComponentProps, EntityCreateEditState, EntityCreateEditData> implements GetMeteorDataInterface<EntityCreateEditData> {
  getInitialState(): EntityCreateEditState {
    return {
      successMessage: false,
      modifiedFieldValues: {}
    };
  }

  getMeteorData() {
    return {
      dataCategories: DataCategories.find({}, {sort: {name: 1}}).fetch()
    };
  }


  getNameInputEl() {
    return this.refs['name'] as HTMLInputElement;
  }

  componentDidMount() {
    const nameInputEl = this.getNameInputEl();
    if (nameInputEl) {
      nameInputEl.focus();
    }
  }

  getAllFieldNames() {
    return ['name', ...this.data.dataCategories.map(dc => dc.name)];
  }

  onNameInput() {
    this.setFieldValue({name: 'name'}, (this.refs['name'] as HTMLInputElement).value);
    this.setState({successMessage: false});
    this.validate();
  }

  onSubmit(ev: React.SyntheticEvent) {
    ev.preventDefault();
    if (!this.validate()) {
      return;
    }
    if (this.isNew()) {
      serverProxy.createEntity(assign(this.props.entity, this.state.modifiedFieldValues));
      this.setState({successMessage: true});
      this.getNameInputEl().value = '';
    } else {
      serverProxy.updateEntity(this.props.entity._id, this.state.modifiedFieldValues);
      FlowRouter.go('entityList');
    }
  }

  validate(): boolean {
    const entity = assign(this.props.entity, this.state.modifiedFieldValues);
    if (isEmpty(entity.name)) {
      this.setState({errorMessage: 'A term needs a surface...'});
      return false;
    }
    this.setState({errorMessage: ''});
    return true;
  }

  isNew() {
    return !this.props.entity._id;
  }

  onChangePickListItem(field: DataCategory, option: PickListSelectOption) {
    this.setFieldValue(field, option.value);
  }

  onChangeReferences(field: DataCategory, options: MiniEntitySelectOption[]) {
    console.log('onChangeReferences', options);
    this.setFieldValue(field, options.map(o => o.entity));
  }

  onChangeTextField(field: DataCategory, ev: React.SyntheticEvent) {
    const value = (ev.target as HTMLInputElement).value;
    this.setFieldValue(field, value);
  }

  setFieldValue(field: {name: string}, value: string | any[]) {
    this.setState({
      modifiedFieldValues: assign(this.state.modifiedFieldValues, {[field.name]: value})
    });
  }

  getReferencesOption(input: string, callback: Function) {
    const limit = 10;
    console.log('getReferencesOption:', input);
    // This timeout prevents a not loading bug on page reload.
    setTimeout(() => {
      const subscription = Meteor.subscribe(PUBLICATIONS.miniEntities, {nameFilterText: input, limit}, () => {
        const entities = Entities.find(createNameFilter(input), {sort: {_lowercase_name: 1}, limit}).fetch();
        console.log('getReferencesOption result:', entities);
        const options: MiniEntitySelectOption []= entities.map(e => ({
          value: e._id,
          label: e.name,
          entity: e
        }));
        callback(null, {options});
        subscription.stop();
      });
    }, 1);
  }

  render() {
    const self = this;
    const s = this.state;
    const entity = this.props.entity;
    if (!entity) {
      return <div></div>;
    }

    const isNew = this.isNew();

    function renderFieldInput(field: DataCategory) {
      const fieldName = field.name;
      const fieldValue = self.state.modifiedFieldValues[fieldName] || entity[fieldName];
      switch (field.type) {
        case FIELD_TYPES.TEXT:
          const onChange = (ev: React.SyntheticEvent) => self.onChangeTextField(field, ev);
          return <input ref={fieldName} className="form-control" id={fieldName} value={fieldValue as string}
                        onInput={onChange} onChange={onChange}/>;
        case FIELD_TYPES.PICK_LIST:
          const options = createSelectOptionsFromPickList(PickLists.findOne(field.pickListId));
          return <Select
            name={fieldName}
            value={fieldValue}
            options={options}
            optionRenderer={renderPickListItem}
            onChange={(option: PickListSelectOption) => self.onChangePickListItem(field, option)}
          />;
        case FIELD_TYPES.REFERENCE:
          const references = fieldValue as MiniEntity[] || [];
          console.log('references:', references);
          const selectedOptions = references.map(e => ({
            label: e.name,
            value: e._id,
            entity: e
          }));
          return <Select.Async
            id={fieldName}
            multi={true}
            name={fieldName}
            value={selectedOptions}
            loadOptions={self.getReferencesOption}
            onChange={(options: any) => self.onChangeReferences(field, options)}
          />;
      }
    }

    function renderField(dataCategory: DataCategory) {
      const fieldName = dataCategory.name;
      return <div className="form-group" key={fieldName}>
        <label htmlFor={fieldName}>{fieldName}:</label>
        {renderFieldInput(dataCategory)}
      </div>;
    }

    const title = isNew ? 'Create New Term' : `Edit Term "${this.props.entity.name}"`;

    return (
      <div className="editEntity">
        <h2>{title}</h2>
        <form action="#" onSubmit={this.onSubmit}>
          <div className="form-group">
            <label htmlFor="name">Term Surface:</label>
            <input ref="name" className="form-control" id="name" placeholder="Term Surface" onInput={this.onNameInput}
                   defaultValue={entity.name}/>
          </div>
          {this.data.dataCategories.map(renderField)}
          {s.successMessage ? this.renderSuccessMessage() : ''}
          {s.errorMessage ? this.renderErrorMessage(s.errorMessage) : ''}
          <button className="btn btn-success">{isNew ? 'Create' : 'Save'}</button>
        </form>
      </div>
    );
  }

  renderSuccessMessage() {
    return <div className="alert alert-success" role="alert">
      Created new term, you can create more terms if you want...
    </div>;
  }

  renderErrorMessage(errorMessage: string) {
    return <div className="alert alert-warning" role="alert">
      {errorMessage}
    </div>;
  }

}


const EntityCreateEdit = mixinReactMeteorData(EntityCreateEditComponent);

this.EntityCreateEdit = EntityCreateEdit;