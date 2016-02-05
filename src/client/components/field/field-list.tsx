/// <reference path="../../../../typings/react/react-global.d.ts" />
/// <reference path="../../../../typings/meteor-hacks.d.ts" />

interface FieldListData {
  dataCategories: DataCategory[];
  pickLists: PickList[];
}


class FieldListComponent extends MeteorDataComponent<{}, {}, FieldListData> implements GetMeteorDataInterface<FieldListData> {
  getMeteorData() {
    return {
      dataCategories: DataCategories.find({}, {sort: {name: 1}}).fetch(),
      pickLists: PickLists.find({}, {sort: {name: 1}}).fetch(),
    };
  }

  getActiveColumns() {
    return ['name', 'type', 'multi', 'pickListId'];
  }

  private deleteField(ev: React.SyntheticEvent, field: DataCategory): any {
    ev.preventDefault();
    serverProxy.deleteField(field._id);
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
    const renderPickListLink = (field: DataCategory) => {
      const pickList = _.find(this.data.pickLists, pl => pl._id === field.pickListId);
      return <a
        href={FlowRouter.path(ROUTE_NAMES.pickListEdit, {pickListId: pickList._id})}>{toDisplayName(pickList.name)}</a>;
    };

    return this.data.dataCategories.map(field =>
      <tr key={field._id}>
        <td>
          {field.system ? '' : (
          <div className="btn-group">
            <button type="button" className="btn btn-default iconButton dropdown-toggle" data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false">
              <span className="glyphicon glyphicon-option-vertical" title="Actions"></span>
            </button>
            <ul className="dropdown-menu dropdown-menu">
              <li>
                <a href="#" onClick={(ev) => this.deleteField(ev,field)}>Delete</a>
              </li>
            </ul>
          </div>)
            }
        </td>
        <td>{toDisplayName(field.name)}</td>
        <td>{field.type}</td>
        <td>{field.multi ? 'multi' : ''}</td>
        <td>{field.pickListId ? renderPickListLink(field) :' '}</td>
      </tr>
    );
  }

}


const FieldList = mixinReactMeteorData(FieldListComponent);

this.FieldList = FieldList;