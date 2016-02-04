/// <reference path="../../../../typings/react/react-global.d.ts" />
/// <reference path="../../../../typings/meteor-hacks.d.ts" />

interface PickListOverviewData {
  pickLists: PickList[];
  fields: DataCategory[];
}


class PickListOverviewComponent extends MeteorDataComponent<{}, {}, PickListOverviewData> implements GetMeteorDataInterface<PickListOverviewData> {
  getMeteorData() {
    return {
      pickLists: PickLists.find({}, {sort: {name: 1}}).fetch(),
      fields: DataCategories.find({}, {sort: {name: 1}}).fetch(),
    };
  }

  getActiveColumns() {
    return ['name'];
  }

  private deletePickList(ev: React.SyntheticEvent, pickLists: PickList): any {
    ev.preventDefault();
    alert('Not implemented, sorry!');
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
        <td><a href={FlowRouter.path(ROUTE_NAMES.pickListEdit, {pickListId: pickList._id})}>{toDisplayName(pickList.name)}</a></td>
      </tr>
    );
  }
}


const PickListOverview = mixinReactMeteorData(PickListOverviewComponent);

this.PickListOverview = PickListOverview;