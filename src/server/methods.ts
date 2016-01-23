interface Command {
  methodName: string;
  args: any[];
}

const commandQueue: Command[] = [];

function executeNextCommandInQueue() {
  const command = commandQueue.shift();
  try {
    if (command) {
      const method: Function = (serverMethods as any)[command.methodName];
      // console.log('Executing Command: ', command.methodName, command.args);
      method(...command.args);
    }
  } catch (error) {
    console.error(error);
  }
  Meteor.setTimeout(executeNextCommandInQueue, 1);
}

executeNextCommandInQueue();

const serverMethods: ServerMethods = {
  createEntity: EntitiesFacade.insert,
  updateEntity: EntitiesFacade.update,
  deleteEntity: EntitiesFacade.deleteEntity,
  createField(field: DataCategory) {
    DataCategories.insert(field);
  },
  deleteField(_id: string) {
    FieldsFacade.deleteField(_id);
  },
};

const queuedServerMethods = _.mapValues(serverMethods, (method, methodName) => (...args: any[]) => {
  commandQueue.push({methodName, args});
});

Meteor.methods(queuedServerMethods);