/// <reference path="../../../../typings/react/react-global.d.ts" />
/// <reference path="../../../../typings/meteor-hacks.d.ts" />

interface CommandLogData {
  commands: CommandLogEntry[];
}


class CommandLogComponentClass extends MeteorDataComponent<{}, {}, CommandLogData> implements GetMeteorDataInterface<CommandLogData> {
  subscription: Meteor.SubscriptionHandle;

  getMeteorData() {
    return {
      commands: CommandLog.find({}, {sort: {requestTime: -1}}).fetch()
    };
  }

  getActiveColumns() {
    return ['command', 'arguments', 'requestTime', 'startTime', 'endTime', 'error'];
  }

  componentWillMount() {
    this.subscription = Meteor.subscribe(PUBLICATIONS.commandLog);
  }

  componentWillUnmount() {
    this.subscription.stop();
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
    return this.getActiveColumns().map(col =>
      <th key={col}>
        {col}
      </th>
    );
  }

  renderFields() {
    const renderAttributeValue = (value: any) => _.isObject(value) ? JSON.stringify(value, null, 2) : value;

    return this.data.commands.map(commandLogEntry => (
      <tr>
        {
          this.getActiveColumns().map(col =>
          <td key={col}>
            <pre>
              {renderAttributeValue((commandLogEntry as any)[col])}
            </pre>
          </td>
            )
          }
      </tr>
    ));
  }

}


const CommandLogComponent = mixinReactMeteorData(CommandLogComponentClass);
this.CommandLogComponent = CommandLogComponent;