/// <reference path="../../../typings/react/react-global.d.ts" />
/// <reference path="../../../typings/meteor-hacks.d.ts" />

interface AppMeteorData {
  entities: Entity[]
}

class AppComponent extends MeteorDataComponent<{},{}, AppMeteorData> implements GetMeteorDataInterface<AppMeteorData> {
  getMeteorData() {
    return {
      entities: Entities.find({}).fetch()
    }
  }

  renderEntities() {
    return this.data.entities.map(entity =>
      <EntityRow key={entity._id} entity={entity}/>
    );
  }

  render() {
    return (
      <div className="container">
        <header>
          <h1>Terminology</h1>
        </header>
        <div>
          {this.renderEntities()}
        </div>
      </div>
    );
  }
}


const MyApp = mixinReactMeteorData(AppComponent);

this.MyApp = MyApp;