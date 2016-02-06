/// <reference path="../../../../typings/react/react-global.d.ts" />
/// <reference path="../../../../typings/meteor-hacks.d.ts" />

interface PickListOverviewData {
  pickLists: PickList[];
  fields: DataCategory[];
}

interface PickListOverviewState {
  newPickListName?: string;
}

class PickListOverviewComponent extends MeteorDataComponent<{}, PickListOverviewState, PickListOverviewData> implements GetMeteorDataInterface<PickListOverviewData> {
  getInitialState(): PickListEditState {
    return {};
  }

  getMeteorData() {
    return {
      pickLists: PickLists.find({}, {sort: {name: 1}}).fetch(),
      fields: DataCategories.find({}, {sort: {name: 1}}).fetch(),
    };
  }

  getActiveColumns() {
    return ['name', 'items'];
  }

  private deletePickList(ev: React.SyntheticEvent, pickList: PickList): any {
    ev.preventDefault();
    serverProxy.deletePickList(pickList._id);
  }

  openAddDialog(ev: React.SyntheticEvent) {
    ev.preventDefault();
    $(this.refs['addDialog']).modal('show');
    this.getNewPickListNameInputEl().value = '';
    this.setState({
      newPickListName: ''
    });
    setTimeout(() => {
      this.getNewPickListNameInputEl().focus();
    }, 500);
  }

  getNewPickListNameInputEl() {
    return this.refs['newPickListName'] as HTMLInputElement;
  }

  onChangeNewPickListName(ev: React.SyntheticEvent) {
    this.setState({
      newPickListName: this.getNewPickListNameInputEl().value
    });
  }

  existNewPickListNameAlready() {
    return _.contains(this.data.pickLists.map(pi => pi.name), this.state.newPickListName);
  }

  addPickList(ev: React.SyntheticEvent) {
    ev.preventDefault();
    const newName = this.getNewPickListNameInputEl().value.trim();
    if (this.existNewPickListNameAlready() || isEmpty(newName)) {
      return;
    }
    $(this.refs['addDialog']).modal('hide');
    serverProxy.addPickList(newName);
  }

  render() {
    const activeColumns = this.getActiveColumns();
    const columnWidth = 100 / activeColumns.length;
    const columnStyle = {
      width: columnWidth + '%'
    };
    return (
      <div>
        <table className="table">
          <colgroup>
            <col/>
            {activeColumns.map(ac => <col key={ac} span={1} style={columnStyle}/>)}
          </colgroup>
          <thead>
            <tr>
              {this.renderTableHeader()}
            </tr>
          </thead>
          <tbody>
            {this.renderFields()}
          </tbody>
        </table>
        <button type="button" className="btn btn-success" onClick={this.openAddDialog}>Add New Pick List</button>
        {this.renderAddDialog()}
      </div>
    );
  }

  renderTableHeader() {
    return [<th key="commandMenu"/>].concat(this.getActiveColumns().map(col =>
      <th key={col}>
        {col}
      </th>
    ));
  }

  renderFields() {
    const isUsedInSomeField = (pickList: PickList) => this.data.fields.some(f => f.pickListId == pickList._id);
    return this.data.pickLists.map(pickList =>
      <tr key={pickList._id}>
        <td>
          {isUsedInSomeField(pickList) ? '' : (
          <div className="btn-group">
            <button type="button" className="btn btn-default iconButton dropdown-toggle" data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false">
              <span className="glyphicon glyphicon-option-vertical" title="Actions"></span>
            </button>
            <ul className="dropdown-menu dropdown-menu">
              <li>
                <a href="#" onClick={(ev) => this.deletePickList(ev,pickList)}>Delete</a>
              </li>
            </ul>
          </div>)
            }
        </td>
        <td>
          <a
            href={FlowRouter.path(ROUTE_NAMES.pickListEdit, {pickListId: pickList._id})}>{toDisplayName(pickList.name)}</a>
        </td>
        <td>
          {getDescendantPickListItems(pickList).map(item => item.name).join(', ')}
        </td>
      </tr>
    );
  }

  renderAddDialog() {
    const nameExistAlready = this.existNewPickListNameAlready();
    return <div ref="addDialog" className="modal fade" tabIndex={-1} role="dialog">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
            <h4 className="modal-title">
              Add new pick list
            </h4>
          </div>
          <div className="modal-body">
            <form action="#" onSubmit={this.addPickList}>
              <div className="form-group">
                <label htmlFor="newPickListName">Pick List Name:</label>
                {nameExistAlready ? renderErrorMessage('A picklist with this name exist already.') : ''}
                <input ref="newPickListName" className="form-control" id="name"
                       placeholder="New Pick List Name" onChange={this.onChangeNewPickListName}/>
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-default" data-dismiss="modal">Cancel</button>
            <button type="button" className="btn btn-primary" onClick={this.addPickList}
                    disabled={nameExistAlready || isEmpty(this.state.newPickListName)}>Add
            </button>
          </div>
        </div>
      </div>
    </div>;
  }


}


const PickListOverview = mixinReactMeteorData(PickListOverviewComponent);

this.PickListOverview = PickListOverview;