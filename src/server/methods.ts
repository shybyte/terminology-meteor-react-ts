type Command = CommandLogEntry;

const commandQueue: Command[] = [];


function executeNextCommandInQueue() {
  const command = commandQueue.shift();
  if (command) {
    try {
      CommandLog.update(command._id, {$set: {startTime: Date.now()}});
      const method: Function = (serverMethods as any)[command.command];
      method(...command.arguments);
      CommandLog.update(command._id, {$set: {endTime: Date.now()}});
    } catch (error) {
      console.error(command, error);
      try {
        CommandLog.update(command._id, {
          $set: {
            endTime: Date.now(),
            error: {
              message: error.message
            }
          }
        });
      } catch (errorWhileSavingErrorLog) {
        console.error(command, errorWhileSavingErrorLog);
      }
    }
  }
  Meteor.setTimeout(executeNextCommandInQueue, 1);
}


executeNextCommandInQueue();

const serverMethods: ServerMethods = {
  createEntity: EntitiesFacade.insert,
  updateEntity: EntitiesFacade.update,
  deleteEntity: EntitiesFacade.deleteEntity,
  createField: FieldsFacade.insert,
  deleteField: FieldsFacade.deleteField,

  updatePickListName: PickListFacade.updatePickListName,
  addPickListItemSister: PickListFacade.addPickListItemSister,
  addPickListItemChild: PickListFacade.addPickListItemChild,
  addRootPickListItem: PickListFacade.addRootPickListItem,
  deletePickListItem: PickListFacade.deletePickListItem,
  addPickList: PickListFacade.addPickList,
  deletePickList: PickListFacade.deletePickList,
};

const queuedServerMethods = _.mapValues(serverMethods, (method, methodName) => (...args: any[]) => {
  try {
    const command: CommandLogEntry = {command: methodName, arguments: args, requestTime: Date.now()};
    const commandId = CommandLog.insert(command);
    commandQueue.push(swap(command, c => {
      c._id = commandId;
    }));
  } catch (error) {
    console.error('Error while queuing command: ', methodName, args);
  }
});

Meteor.methods(queuedServerMethods);