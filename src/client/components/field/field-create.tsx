/// <reference path="../../../../typings/react/react-global.d.ts" />
/// <reference path="../../../../typings/meteor-hacks.d.ts" />

interface FieldCreateComponentProps {
}

interface FieldCreateData {
  dataCategories: DataCategory[];
}

interface FieldCreateState {
  successMessage?: boolean;
  errorMessage?: string;
}


class FieldCreateComponent extends MeteorDataComponent<FieldCreateComponentProps, FieldCreateState, FieldCreateData> implements GetMeteorDataInterface<FieldCreateData> {
  getInitialState(): FieldCreateState {
    return {
      successMessage: false
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
    return ['name'];
  }

  onNameInput() {
    this.setState({successMessage: false});
    this.validate();
  }

  getFormAsField(): DataCategory {
    const allFieldNames = this.getAllFieldNames();
    const fieldValuePairs = allFieldNames.map(fieldName => [fieldName, (this.refs[fieldName] as HTMLInputElement).value]);
    return _.zipObject(fieldValuePairs) as DataCategory;
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
      this.setState({errorMessage: 'A Field needs a surface...'});
      return false;
    }
    this.setState({errorMessage: ''});
    return true;
  }

  render() {
    const s = this.state;
    return (
      <div>
        <h2>Create New Field</h2>
        <form action="#" onSubmit={this.onSubmit}>
          <div className="form-group">
            <label htmlFor="name">Field Name:</label>
            <input ref="name" className="form-control" id="name" placeholder="Field Name" onInput={this.onNameInput}/>
          </div>
          {s.successMessage ? this.renderSuccessMessage() : ''}
          {s.errorMessage ? this.renderErrorMessage(s.errorMessage) : ''}
          <button className="btn btn-success">Create Field</button>
        </form>
      </div>
    );
  }

  renderSuccessMessage() {
    return <div className="alert alert-success" role="alert">
      Created new Field, you can create more Fields if you want...
    </div>;
  }

  renderErrorMessage(errorMessage: string) {
    return <div className="alert alert-warning" role="alert">
      {errorMessage}
    </div>;
  }

}


const FieldCreate = mixinReactMeteorData(FieldCreateComponent);

this.FieldCreate = FieldCreate;