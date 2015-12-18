/// <reference path="../../../typings/react/react-global.d.ts" />
/// <reference path="../../../typings/meteor-hacks.d.ts" />

interface AppMeteorData {
  tasks: Task[]
}

class AppComponent extends MeteorDataComponent<{},{}, AppMeteorData> implements GetMeteorDataInterface<AppMeteorData> {
  getMeteorData()  {
    return {
      tasks: Tasks.find({}).fetch() as Task[]
    }
  }

  renderTasks()  {
    return this.data.tasks.map(task =>
      <Task key={task._id} task={task}/>
    );
  }

  render() {
    return (
      <div className="container">
        <header>
          <h1>Todo List!!!</h1>
        </header>

        <ul>
          {this.renderTasks()}
        </ul>
      </div>
    );
  }
}


var MyApp = mixinReactMeteorData(AppComponent);
var myApp = React.createFactory(MyApp);

this.MyApp = MyApp;