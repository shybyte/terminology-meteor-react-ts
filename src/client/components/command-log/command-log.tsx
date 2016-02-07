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
    return ['Request Time', 'Command', 'Arguments', 'Queueing Duration', 'Duration', 'Error'];
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
      <div className="commandLog">
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
    const renderObject = (o: {}) => o ? (<pre>{JSON.stringify(o, null, 2)}</pre>) : '';
    const renderTime = (t: number) => new Date(t).toLocaleString();
    return this.data.commands.map(commandLogEntry => (
      <tr key={commandLogEntry._id} className={commandLogEntry.error ? 'errorRow' : ''}>
        <td>
          {renderTime(commandLogEntry.requestTime)}
        </td>
        <td>
          {commandLogEntry.command}
        </td>
        <td>
          {renderObject(commandLogEntry.arguments)}
        </td>
        <td>
          {commandLogEntry.startTime - commandLogEntry.requestTime} ms
        </td>
        <td>
          {commandLogEntry.endTime - commandLogEntry.startTime} ms
        </td>
        <td>
          {renderObject(commandLogEntry.error)}
        </td>
      </tr>
    ));
  }

}


const CommandLogComponent = mixinReactMeteorData(CommandLogComponentClass);
this.CommandLogComponent = CommandLogComponent;