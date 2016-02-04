/**
 * This seemingly empty methods will be implemented in createServerProxy()
 */
class ServerProxy implements ServerMethods {


  createEntity(e: EntityInsert) {
  }

  updateEntity(_id: string, e: EntityUpdate) {
  }

  deleteEntity(_id: string) {
  }

  createField(field: DataCategory) {
  }

  deleteField(_id: string) {
  }

  updatePickListName(_id: string, newName: string) {
  };

  addPickListItemSister(pickListId: string, brotherItemId: string , newName: string): void {
  }
  addPickListItemChild(pickListId: string, parentItemId: string , newName: string): void {
  }
}

function createServerProxy() {
  const serverProxy: any = new ServerProxy();
  Object.keys(ServerProxy.prototype).forEach((methodName) => {
    serverProxy[methodName] = function (...args: any[]) {
      Meteor.call(methodName, ...args);
    };
  });
  return serverProxy as ServerProxy;
}


const serverProxy = createServerProxy();
this.serverProxy = serverProxy;