/// <reference path="../../../../typings/react/react-global.d.ts" />
/// <reference path="../../../../typings/meteor-hacks.d.ts" />

interface EntityCreateEditComponentProps {
  entity: Entity;
}

interface EntityCreateEditData {
  dataCategories: DataCategory[];
}

interface EntityCreateEditState {
  successMessage?: boolean;
  errorMessage?: string;
}


class EntityCreateEditComponent extends MeteorDataComponent<EntityCreateEditComponentProps, EntityCreateEditState, EntityCreateEditData> implements GetMeteorDataInterface<EntityCreateEditData> {
  getInitialState(): EntityCreateEditState {
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
    if (this.isNew()) {
      serverProxy.createEntity(this.getFormAsEntity());
      this.setState({successMessage: true});
      this.getNameInputEl().value = '';
    } else {
      serverProxy.saveEntity(assign({_id: this.props.entity._id}, this.getFormAsEntity()));
      FlowRouter.go('entityList');
    }
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

  isNew() {
    return !this.props.entity._id;
  }

  render() {
    const s = this.state;
    const entity = this.props.entity;
    if (!entity) {
      return <div></div>;
    }

    const isNew = this.isNew();

    function renderField(dataCategory: DataCategory) {
      const fieldName = dataCategory.name;
      return <div className="form-group" key={fieldName}>
        <label htmlFor={fieldName}>{fieldName}:</label>
        <input ref={fieldName} className="form-control" id={fieldName} defaultValue={entity[fieldName]}/>
      </div>;
    }

    const title = isNew ? 'Create New Term' : `Edit Term "${this.props.entity.name}"`;
    return (
      <div>
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