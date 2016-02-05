/// <reference path="../../../../typings/react/react-global.d.ts" />
/// <reference path="../../../../typings/meteor-hacks.d.ts" />

interface FieldCreateComponentProps {
}

interface FieldCreateData {
  pickLists: PickList[];
  dataCategories: DataCategory[];
  existingFieldNames: string[];
}

interface FieldCreateState {
  type?: string;
  successMessage?: boolean;
  errorMessage?: string;
}


class FieldCreateComponent extends MeteorDataComponent<FieldCreateComponentProps, FieldCreateState, FieldCreateData> implements GetMeteorDataInterface<FieldCreateData> {
  getInitialState(): FieldCreateState {
    return {
      type: FIELD_TYPES.TEXT,
      successMessage: false
    };
  }

  getMeteorData() {
    const dataCategories = DataCategories.find({}, {sort: {name: 1}}).fetch();
    return {
      pickLists: PickLists.find({}).fetch(),
      existingFieldNames: ['name', 'type', ...dataCategories.map(dc => dc.name), ..._.compact(dataCategories.map(dc => dc.backwardName))],
      dataCategories
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


  onNameInput() {
    this.setState({successMessage: false});
    this.validate();
  }

  getFormAsField(): DataCategory {
    const name = getRefValue(this, 'name');
    const type = getRefValue(this, 'type');
    const entityType = getRefValue(this, 'entityType');
    const pickListId = getRefValue(this, 'pickListId');
    const multi = type === FIELD_TYPES.PICK_LIST ? getCheckBoxRefValue(this, 'multi') : (type === FIELD_TYPES.REFERENCE);
    const backwardNameRawValue = getRefValue(this, 'backwardName');
    const backwardName = (type === FIELD_TYPES.REFERENCE && backwardNameRawValue) ? backwardNameRawValue : undefined;
    const entityTypes = [entityType];
    return {name, type, pickListId, multi, entityTypes, targetEntityTypes: entityTypes, backwardName, system: false, inherit: false};
  }

  onSubmit(ev: React.SyntheticEvent) {
    ev.preventDefault();
    if (!this.validate()) {
      return;
    }
    serverProxy.createField(this.getFormAsField());
    this.setState({successMessage: true});
    this.getNameInputEl().value = '';
  }

  validate(): boolean {
    const newField = this.getFormAsField();
    if (isEmpty(newField.name)) {
      this.setState({errorMessage: 'A real field needs a real name.'});
      return false;
    }
    if (_.contains(this.data.existingFieldNames, newField.name) || newField.name === 'language') {
      this.setState({errorMessage: 'This field name exist already.'});
      return false;
    }
    if (_.startsWith(newField.name, '_')) {
      this.setState({errorMessage: 'A field name should not start with _ .'});
      return false;
    }
    this.setState({errorMessage: ''});
    return true;
  }

  onChangeType() {
    this.setState({
      type: this.getFormAsField().type
    });
  }

  render() {
    const s = this.state;
    return (
      <div>
        <h2>Create New Field</h2>
        <form action="#" onSubmit={this.onSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <input ref="name" className="form-control" id="name" placeholder="Field Name" onInput={this.onNameInput}/>
          </div>
          <div className="form-group">
            <label htmlFor="entityType">Entity Type:</label>
            <select ref="entityType" className="form-control" id="entityType">
              <option value={ENTITY_TYPES.C}>Concept</option>
              <option value={ENTITY_TYPES.T}>Term</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="type">Field Type:</label>
            <select ref="type" className="form-control" id="type" onChange={this.onChangeType} value={s.type}>
              <option value={FIELD_TYPES.TEXT}>Text</option>
              <option value={FIELD_TYPES.PICK_LIST}>PickList</option>
              <option value={FIELD_TYPES.REFERENCE}>Reference</option>
            </select>
          </div>

          {s.type === FIELD_TYPES.PICK_LIST ?  this.renderMultiCheckBox() : ''}
          {s.type === FIELD_TYPES.PICK_LIST ?  this.renderPickListSelector() : ''}

          {s.type === FIELD_TYPES.REFERENCE ?  this.renderReferenceSection() : ''}

          {s.successMessage ? this.renderSuccessMessage() : ''}
          {s.errorMessage ? renderErrorMessage(s.errorMessage) : ''}
          <button className="btn btn-success">Create Field</button>
        </form>
      </div>
    );
  }

  renderReferenceSection() {
    return <div className="form-group">
      <label htmlFor="backwardName">Optional Backward Name:</label>
      <input ref="backwardName" className="form-control" id="backwardName" placeholder="Backward Name"/>
    </div>;
  }


  renderMultiCheckBox() {
    return <div className="checkbox">
      <label>
        <input ref="multi" type="checkbox"/>
        Multiple Values
      </label>
    </div>;
  }

  renderPickListSelector() {
    console.log(this.data.pickLists);
    return <div className="form-group">
      <label htmlFor="pickListId">Picklist:</label>
      <select ref="pickListId" className="form-control" id="pickListId">
        {this.data.pickLists.map(pickList => <option key={pickList._id} value={pickList._id}>{pickList.name}</option>)}
      </select>
    </div>;
  }

  renderSuccessMessage() {
    return <div className="alert alert-success" role="alert">
      Created new Field, you can create more Fields if you want...
    </div>;
  }
}


const FieldCreate = mixinReactMeteorData(FieldCreateComponent);

this.FieldCreate = FieldCreate;