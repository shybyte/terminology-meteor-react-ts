/// <reference path="../../../../typings/react/react-global.d.ts" />
/// <reference path="../../../../typings/meteor-hacks.d.ts" />
/// <reference path="../../../../typings/react-select.d.ts" />

interface EntityCreateEditComponentProps {
  entity: EntityInsert;
}

interface EntityCreateEditData {
  dataCategories: DataCategory[];
  pickLists: PickList[];
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
      dataCategories: DataCategories.find({}, {sort: {name: 1}}).fetch(),
      pickLists: PickLists.find({}, {sort: {name: 1}}).fetch()
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
    this.setFieldValue('name', (this.refs['name'] as HTMLInputElement).value);
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
    if (!option) {
      this.setFieldValue(field.name, []);
      return;
    }
    this.setFieldValue(field.name, Array.isArray(option) ? option.map(o => o.value) : [option.value]);
  }

  onChangeReferences(fieldName: string, options: MiniEntitySelectOption | MiniEntitySelectOption[]) {
    console.log('onChangeReferences', options);
    if (!options) {
      this.setFieldValue(fieldName, []);
      return;
    }
    this.setFieldValue(fieldName, Array.isArray(options) ? options.map(o => o.entity) : [options.entity]);
  }

  onChangeTextField(field: DataCategory, ev: React.SyntheticEvent) {
    const value = (ev.target as HTMLInputElement).value;
    this.setFieldValue(field.name, value);
  }

  setFieldValue(name: string, value: string | any[]) {
    this.setState({
      modifiedFieldValues: assign(this.state.modifiedFieldValues, {[name]: value})
    });
  }

  getReferencesOption(entityTypes: string[], input: string, callback: Function) {
    const limit = 10;
    // This timeout prevents a not loading bug on page reload.
    setTimeout(() => {
      const ignoreEntities = [this.props.entity._id].filter(_.isString);
      const searchParameters = {
        nameFilterText: input,
        types: entityTypes,
        ignoreEntities,
        limit
      };
      const subscription = Meteor.subscribe(PUBLICATIONS.miniEntities, searchParameters, () => {
        const selector = createEntitySelector(searchParameters);
        const entities = Entities.find(selector, {sort: {_lowercase_name: 1}, limit}).fetch();
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

    const renderFieldInput = (field: DataCategory, backward: boolean) => {
      const fieldName = field.name;
      const modifiedFieldValues = self.state.modifiedFieldValues;
      const fieldValue = modifiedFieldValues[fieldName] !== undefined ? modifiedFieldValues[fieldName] : entity[fieldName];
      switch (field.type) {
        case FIELD_TYPES.TEXT:
          const onChange = (ev: React.SyntheticEvent) => self.onChangeTextField(field, ev);
          return <input ref={fieldName} className="form-control" id={fieldName} value={fieldValue as string}
                        onInput={onChange} onChange={onChange}/>;
        case FIELD_TYPES.PICK_LIST:
          const options = createSelectOptionsFromPickList(_.find(this.data.pickLists, pl => pl._id === field.pickListId));
          return <Select
            name={fieldName}
            value={field.multi ? fieldValue : (fieldValue ? fieldValue[0] : undefined)}
            multi={field.multi}
            options={options}
            optionRenderer={renderPickListItem}
            onChange={(option: PickListSelectOption) => self.onChangePickListItem(field, option)}
          />;
        case FIELD_TYPES.REFERENCE:
          const backwardName = field.backwardName;
          const references = (backward ? (modifiedFieldValues[backwardName] !== undefined ? modifiedFieldValues[backwardName] : entity[backwardName])
              : fieldValue) as MiniEntity[] || [];
          const selectedOptions = references.map(e => ({
            label: e.name,
            value: e._id,
            entity: e
          }));
          const entityTypes = backward ? field.entityTypes : field.targetEntityTypes;
          const refFieldName = backward ? backwardName : fieldName;
          const multi = backward ? field.backwardMulti : field.multi;
          return <Select.Async
            id={refFieldName}
            multi={multi}
            name={refFieldName}
            value={multi ? selectedOptions : selectedOptions[0]}
            valueRenderer={renderReferenceReactSelectValue}
            loadOptions={(input: string, callback: Function) =>  self.getReferencesOption(entityTypes, input, callback)}
            onChange={(options: any) => self.onChangeReferences(refFieldName, options)}
          />;
      }
    };

    function renderFieldReadOnly(field: DataCategory, backward: boolean) {
      const fieldName = field.name;
      const modifiedFieldValues = self.state.modifiedFieldValues;
      const fieldValue = modifiedFieldValues[fieldName] !== undefined ? modifiedFieldValues[fieldName] : entity[fieldName];
      switch (field.type) {
        case FIELD_TYPES.TEXT:
          return <div>{fieldValue}</div>;
        case FIELD_TYPES.PICK_LIST:
          return <div>{((fieldValue || []) as string[]).join(', ')}</div>;
        case FIELD_TYPES.REFERENCE:
          const backwardName = field.backwardName;
          const refs = (backward ? (modifiedFieldValues[backwardName] !== undefined ? modifiedFieldValues[backwardName] : entity[backwardName])
              : fieldValue) as MiniEntity[] || [];
          return <div className="referencesReadOnly">
            {refs.map(ref => (<a key={ref._id} href={FlowRouter.path('edit', {entityId: ref._id})}>{ref.name}</a>))}
          </div>;
      }
    }

    function renderField(field: DataCategory) {
      const fieldElements: React.ReactElement<any>[] = [];

      const fieldName = field.name;
      // TODO: Clean up this painful code duplication
      if (_.contains(field.entityTypes, entity.type)) {
        fieldElements.push(<div className="form-group" key={fieldName}>
          <label htmlFor={fieldName}>{toDisplayName(fieldName)}:</label>
          {renderFieldInput(field, false)}
        </div>);
      } else if (!field.inherit) {
        fieldElements.push(<div className="form-group" key={fieldName}>
          <label>{toDisplayName(fieldName)}:</label>
          {renderFieldReadOnly(field, false)}
        </div>);
      }

      if (field.backwardName) {
        if (_.contains(field.targetEntityTypes, entity.type)) {
          fieldElements.push(<div className="form-group" key={field.backwardName}>
              <label htmlFor={field.backwardName}>{toDisplayName(field.backwardName)}:</label>
              {renderFieldInput(field, true)}
            </div>
          );
        } else if (!field.inherit) {
          fieldElements.push(<div className="form-group" key={field.backwardName}>
            <label>{toDisplayName(field.backwardName)}:</label>
            {renderFieldReadOnly(field, true)}
          </div>);
        }
      }

      return fieldElements;
    }

    const typeName = this.getTypeName();
    const title = isNew ? `Create new ${typeName}` : `Edit ${typeName} "${this.props.entity.name}"`;
    const displayedFields = this.data.dataCategories.filter(f =>
      (entity.type === ENTITY_TYPES.T && !isNew) || _.contains(f.entityTypes, this.props.entity.type) || _.contains(f.targetEntityTypes, this.props.entity.type)
    );

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
          {displayedFields.map(renderField)}
          {s.successMessage ? this.renderSuccessMessage() : ''}
          {s.errorMessage ? renderErrorMessage(s.errorMessage) : ''}
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
}


const EntityCreateEdit = mixinReactMeteorData(EntityCreateEditComponent);

this.EntityCreateEdit = EntityCreateEdit;