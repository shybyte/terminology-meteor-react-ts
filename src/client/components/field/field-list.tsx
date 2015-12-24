/// <reference path="../../../../typings/react/react-global.d.ts" />
/// <reference path="../../../../typings/meteor-hacks.d.ts" />

interface FieldListData {
  dataCategories: DataCategory[];
}


class FieldListComponent extends MeteorDataComponent<{}, {}, FieldListData> implements GetMeteorDataInterface<FieldListData> {
  getMeteorData() {
    return {
      dataCategories: DataCategories.find({}, {sort: {name: 1}}).fetch(),
    };
  }

  getActiveColumns() {
    return ['name'];
  }

  private deleteField(field: DataCategory): any {
    serverProxy.deleteField(field);
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
    return this.getActiveColumns().map(col =>
      <th key={col}>
        {col}
      </th>
    );
  }

  renderFields() {
    return this.data.dataCategories.map(field =>
      <tr key={field._id}><td>{field.name} <button onClick={() => this.deleteField(field)}>Delete</button></td></tr>
    );
  }
}




const FieldList = mixinReactMeteorData(FieldListComponent);

this.FieldList = FieldList;