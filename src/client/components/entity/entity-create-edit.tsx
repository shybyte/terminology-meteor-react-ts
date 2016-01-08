/// <reference path="../../../../typings/react/react-global.d.ts" />
/// <reference path="../../../../typings/meteor-hacks.d.ts" />
/// <reference path="../../../../typings/react-select.d.ts" />

interface EntityCreateEditComponentProps {
  entity: EntityInsert;
}

interface EntityCreateEditData {
  dataCategories: DataCategory[];
}

interface EntityCreateEditState {
  successMessage?: boolean;
  errorMessage?: string;
  modifiedFieldValues?: EntityUpdate;
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
      FlowRouter.go(this.props.entity.type === ENTITY_TYPES.C ? ROUTE_NAMES.conceptList : ROUTE_NAMES.termList);
    }
  }

  validate(): boolean {
    const entity = assign(this.props.entity, this.state.modifiedFieldValues);
    if (isEmpty(entity.name)) {
      this.setState({errorMessage: `A ${this.getTypeName()} needs a surface...`});
      return false;
    }
    this.setState({errorMessage: ''});
    return true;
  }

  isNew() {
    return !this.props.entity._id;
  }

  onChangePickListItem(field: DataCategory, option: PickListSelectOption | PickListSelectOption[]) {
    this.setFieldValue(field, Array.isArray(option) ? option.map(o => o.value) : [option.value]);
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

  getReferencesOption(field: DataCategory, input: string, callback: Function) {
    const limit = 10;
    console.log('getReferencesOption:', input);
    // This timeout prevents a not loading bug on page reload.
    setTimeout(() => {
      const subscription = Meteor.subscribe(PUBLICATIONS.miniEntities, {
        nameFilterText: input,
        types: field.targetEntityTypes,
        limit
      }, () => {
        const selector = assign(createNameSelector(input), {type: {$in: field.targetEntityTypes}});
        console.log('selector ', selector);
        const entities = Entities.find(selector, {sort: {_lowercase_name: 1}, limit}).fetch();
        console.log('getReferencesOption result:', entities);
        const options: MiniEntitySelectOption [] = entities.map(e => ({
          value: e._id,
          label: e.name,
          entity: e
        }));
        callback(null, {options});
        subscription.stop();
      });
    }, 1);
  }

  getTypeName() {
    return localizeEntityType(this.props.entity.type);
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
      const modifiedFieldValues = self.state.modifiedFieldValues;
      const fieldValue = modifiedFieldValues[fieldName] !== undefined ? modifiedFieldValues[fieldName] : entity[fieldName];
      switch (field.type) {
        case FIELD_TYPES.TEXT:
          const onChange = (ev: React.SyntheticEvent) => self.onChangeTextField(field, ev);
          return <input ref={fieldName} className="form-control" id={fieldName} value={fieldValue as string}
                        onInput={onChange} onChange={onChange}/>;
        case FIELD_TYPES.PICK_LIST:
          const options = createSelectOptionsFromPickList(PickLists.findOne(field.pickListId));
          return <Select
            name={fieldName}
            value={field.multi ? fieldValue : (fieldValue ? fieldValue[0] : undefined)}
            multi={field.multi}
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
            loadOptions={self.getReferencesOption.bind(self, field)}
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

    const typeName = this.getTypeName();
    const title = isNew ? `Create new ${typeName}` : `Edit ${typeName} "${this.props.entity.name}"`;
    const editableFields = this.data.dataCategories.filter(f => _.contains(f.entityTypes, this.props.entity.type));

    return (
      <div className="editEntity">
        <h2>{title}</h2>
        <form action="#" onSubmit={this.onSubmit}>
          <div className="form-group">
            <label htmlFor="name">{typeName} Surface:</label>
            <input ref="name" className="form-control" id="name" placeholder={typeName + ' Surface'}
                   onInput={this.onNameInput}
                   defaultValue={entity.name}/>
          </div>
          {editableFields.map(renderField)}
          {s.successMessage ? this.renderSuccessMessage() : ''}
          {s.errorMessage ? this.renderErrorMessage(s.errorMessage) : ''}
          <button className="btn btn-success">{isNew ? 'Create' : 'Save'}</button>
        </form>
      </div>
    );
  }

  renderSuccessMessage() {
    return <div className="alert alert-success" role="alert">
      Created new {this.getTypeName()}, you can create more {this.getTypeName()}s if you want...
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