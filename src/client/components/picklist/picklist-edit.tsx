/// <reference path="../../../../typings/react/react-global.d.ts" />
/// <reference path="../../../../typings/meteor-hacks.d.ts" />
/// <reference path="../../../../typings/bootstrap.d.ts" />

interface FieldCreateComponentProps {
}

interface PickListEditProps {
  pickListId: string;
}


interface PickListEditData {
  pickList: PickList;
}

interface PickListEditState {
  editName?: boolean;
  name?: string;
  addType?: string; // 'sister' or 'child'
  addTo?: PickListItem;
  newPickListItemName?: string;
}


class PickListEditComponent extends MeteorDataComponent<PickListEditProps, PickListEditState, PickListEditData> implements GetMeteorDataInterface<PickListEditData> {
  getInitialState(): PickListEditState {
    return {editName: false};
  }

  getMeteorData() {
    return {
      pickList: PickLists.findOne(this.props.pickListId),
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

  onSubmitName(ev: React.SyntheticEvent) {
    ev.preventDefault();
    const name = this.getNameInputEl().value;
    if (!isEmpty(name)) {
      serverProxy.updatePickListName(this.props.pickListId, name);
    }
    this.setState({
      editName: false,
      name: null
    });
  }


  startEditName() {
    this.setState({
      editName: true,
      name: this.data.pickList.name
    });
    setTimeout(() => {
      this.getNameInputEl().focus();
    }, 100);
  }

  onChangeName() {
    this.setState({
      name: this.getNameInputEl().value
    });
  }

  cancelChangeName() {
    this.setState({
      editName: false
    });
  }

  openAddChildOrSisterDialog(ev: React.SyntheticEvent, pickListItem: PickListItem, addType: string) {
    ev.preventDefault();
    this.setState({
      addType,
      addTo: pickListItem
    });
    this.openAddDialog();
  }

  openAddRootItemDialog(ev: React.SyntheticEvent) {
    ev.preventDefault();
    this.setState({
      addType: 'root',
      addTo: null
    });
    this.openAddDialog();
  }

  openAddDialog() {
    $(this.refs['addDialog']).modal('show');
    this.getNewItemNameInputEl().value = '';
    this.setState({
      newPickListItemName: ''
    });
    setTimeout(() => {
      this.getNewItemNameInputEl().focus();
    }, 500);
  }

  getNewItemNameInputEl() {
    return this.refs['newPickListItemName'] as HTMLInputElement;
  }

  onChangeNewPickListItemName(ev: React.SyntheticEvent) {
    this.setState({
      newPickListItemName: this.getNewItemNameInputEl().value
    });
  }

  existNewPickListItemNameAlready() {
    return _.contains(getDescendantPickListItems(this.data.pickList).map(pi => pi.name), this.state.newPickListItemName);
  }

  addPickListItem(ev: React.SyntheticEvent) {
    ev.preventDefault();
    if (this.existNewPickListItemNameAlready()) {
      return;
    }
    const newName = this.getNewItemNameInputEl().value.trim();
    $(this.refs['addDialog']).modal('hide');
    switch (this.state.addType) {
      case 'sister':
        serverProxy.addPickListItemSister(this.props.pickListId, this.state.addTo.name, newName);
        break;
      case 'child':
        serverProxy.addPickListItemChild(this.props.pickListId, this.state.addTo.name, newName);
        break;
      case 'root':
        serverProxy.addRootPickListItem(this.props.pickListId, newName);
        break;
      default:
        console.error('Unknown addType');
    }
  }

  deleteItem(ev: React.SyntheticEvent, item: PickListItem) {
    ev.preventDefault();
    serverProxy.deletePickListItem(this.props.pickListId, item.name);
  }

  render() {
    const s = this.state;
    const pickList = this.data.pickList;

    if (!pickList) {
      return <div>Loading...</div>;
    }

    const renderNameInput = () => (<form action="#" onSubmit={this.onSubmitName}>
      <div className="form-group">
        <label htmlFor="name">Name:</label>
        <input ref="name" className="form-control" id="name" placeholder="Pick List Name"
               onChange={this.onChangeName} onBlur={this.cancelChangeName} value={s.name}/>
      </div>
    </form>);

    const renderTree = (pickListItems: PickListItem[]): any => {
      if (!pickListItems || pickListItems.length === 0) {
        return <div></div>;
      }
      return <ul className="pickListTree">
        {pickListItems.map(pickListItem => <li key={pickListItem.name}>
          <div className="dropdown">
            <button className="btn btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown"
                    aria-haspopup="true" aria-expanded="true">
              {pickListItem.name}
              <span className="caret"></span>
            </button>
            <ul className="dropdown-menu" aria-labelledby="dropdownMenu1">
              <li>
                <a href="#" onClick={(ev) => this.openAddChildOrSisterDialog(ev, pickListItem, 'sister')}>
                  Add Sister Before
                </a>
              </li>
              <li>
                <a href="#" onClick={(ev) => this.openAddChildOrSisterDialog(ev, pickListItem, 'child')}>Add Child</a>
              </li>
              <li>
                <a href="#" onClick={(ev) => this.deleteItem(ev, pickListItem)}>Delete</a>
              </li>
            </ul>
          </div>
          {renderTree(pickListItem.items)}
        </li>)}
      </ul>;
    };

    return (
      <div>
        <h2>Edit Pick List</h2>
        {s.editName ? renderNameInput() : (<h3 className="clickToEdit"
                                               onClick={this.startEditName}>{pickList.name}</h3>)}
        {renderTree(pickList.items)}

        <button type="button" className="btn btn-success" onClick={this.openAddRootItemDialog}>Add Item</button>

        {this.renderAddDialog()}
      </div>
    );
  }

  getAddItemDialogTitle() {
    const s = this.state;
    switch (this.state.addType) {
      case 'sister':
        return 'sister item before ' + (s.addTo && s.addTo.name);
      case 'child':
        return 'child item to ' + (s.addTo && s.addTo.name);
      case 'root':
      default:
        return 'root item';
    }
  }

  renderAddDialog() {
    const nameExistAlready = this.existNewPickListItemNameAlready();
    return <div ref="addDialog" className="modal fade" tabIndex={-1} role="dialog">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
            <h4 className="modal-title">
              Add {this.getAddItemDialogTitle()}
            </h4>
          </div>
          <div className="modal-body">
            <form action="#" onSubmit={this.addPickListItem}>
              <div className="form-group">
                <label htmlFor="newPickListItemName">Item Name:</label>
                {nameExistAlready ? renderErrorMessage('This name exist already in this pick list.') : ''}
                <input ref="newPickListItemName" className="form-control" id="name"
                       placeholder="Pick List Item Name" onChange={this.onChangeNewPickListItemName}/>
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-default" data-dismiss="modal">Cancel</button>
            <button type="button" className="btn btn-primary" onClick={this.addPickListItem}
                    disabled={nameExistAlready}>Add
            </button>
          </div>
        </div>
      </div>
    </div>;
  }

}


const PickListEdit = mixinReactMeteorData(PickListEditComponent);

this.PickListEdit = PickListEdit;