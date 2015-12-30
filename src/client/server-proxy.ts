class ServerProxy implements ServerMethods {
  createEntity(e: EntityInsert) {
  }

  updateEntity(_id: string, e: EntityUpdate) {
  }

  createField(field: DataCategory) {
  }

  deleteField(field: DataCategory) {
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