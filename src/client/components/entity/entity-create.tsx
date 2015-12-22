/// <reference path="../../../../typings/react/react-global.d.ts" />
/// <reference path="../../../../typings/meteor-hacks.d.ts" />

interface EntityCreateData {
  dataCategories: DataCategory[];
}

interface EntityCreateState {
  successMessage?: boolean;
  errorMessage?: string;
}


class EntityCreateComponent extends MeteorDataComponent<{}, EntityCreateState, EntityCreateData> implements GetMeteorDataInterface<EntityCreateData> {
  getInitialState(): EntityCreateState {
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
    this.getNameInputEl().focus();
  }

  getAllFieldNames() {
    return ['name', ...this.data.dataCategories.map(dc => dc.name)];
  }

  onNameInput() {
    this.setState({successMessage: false});
    this.validate();
  }

  getFormAsEntity(): Entity {
    const allFieldNames = this.getAllFieldNames();
    const fieldValuePairs = allFieldNames.map(fieldName => [fieldName, (this.refs[fieldName] as HTMLInputElement).value]);
    return _.zipObject(fieldValuePairs) as Entity;
  }

  onSubmit(ev: React.SyntheticEvent) {
    ev.preventDefault();
    if (!this.validate()) {
        return;
    }
    Meteor.call('createEntity', this.getFormAsEntity());
    this.setState({successMessage: true});
    this.getNameInputEl().value = '';
  }

  validate(): boolean {
    const newEntity = this.getFormAsEntity();
    if (isEmpty(newEntity.name)) {
      this.setState({errorMessage: 'A term needs a surface...'});
      return false;
    }
    this.setState({errorMessage: ''});
    return true;
  }

  render() {
    const s = this.state;

    function renderField(dataCategory: DataCategory) {
      const fieldName = dataCategory.name;
      return <div className="form-group" key={fieldName}>
        <label htmlFor={fieldName}>{fieldName}:</label>
        <input ref={fieldName} className="form-control" id={fieldName}/>
      </div>;
    }

    console.log(s.errorMessage);
    return (
      <div>
        <h2>Create New Term</h2>
        <form action="#" onSubmit={this.onSubmit}>
          <div className="form-group">
            <label htmlFor="name">Term Surface:</label>
            <input ref="name" className="form-control" id="name" placeholder="Term Surface" onInput={this.onNameInput}/>
          </div>
          {this.data.dataCategories.map(renderField)}
          {s.successMessage ? this.renderSuccessMessage() : ''}
          {s.errorMessage ? this.renderErrorMessage(s.errorMessage) : ''}
          <button className="btn btn-success">Create</button>
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


const EntityCreate = mixinReactMeteorData(EntityCreateComponent);

this.EntityCreate = EntityCreate;