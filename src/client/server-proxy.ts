class ServerProxy implements ServerMethods {
  createEntity(e: Entity) {
  }

  saveEntity(e: Entity) {
  }

  createField(field: DataCategory) {
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