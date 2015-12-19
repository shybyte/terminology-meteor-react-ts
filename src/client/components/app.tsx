/// <reference path="../../../typings/react/react-global.d.ts" />
/// <reference path="../../../typings/meteor-hacks.d.ts" />

interface AppMeteorData {
  entities: Entity[];
}

interface AppState {
  filterText?: string;
  subscription?: Meteor.SubscriptionHandle;
  limit?: number;
}


class AppComponent extends MeteorDataComponent<{}, AppState, AppMeteorData> implements GetMeteorDataInterface<AppMeteorData> {
  getInitialState(): AppState {
    return {
      filterText: 'tz',
      limit: 20
    };
  }

  getMeteorData() {
    const s = this.state;
    return {
      entities: Entities.find(createNameFilter(s.filterText), {sort: {name: 1}, limit: s.limit}).fetch()
    };
  }

  renderEntities() {
    return this.data.entities.map(entity =>
      <EntityRow key={entity._id} entity={entity}/>
    );
  }

  getFilterInputEl() {
    return this.refs['filter'] as HTMLInputElement;
  }

  onFilterChanged() {
    const filterText = this.getFilterInputEl().value.trim();
    this.setState({filterText});
    this.updateSubscription(filterText);
  }

  updateSubscription(filterText: string) {
    if (this.state.subscription) {
      this.state.subscription.stop();
    }
    const subscription = Meteor.subscribe('entities', {nameFilterText: filterText, limit: this.state.limit});
    this.setState({subscription});
  }

  componentDidMount() {
    this.getFilterInputEl().focus();
    this.updateSubscription(this.state.filterText);
  }

  render() {
    const onFilterChanged = () => this.onFilterChanged();
    return (
      <div className="container">
        <header>
          <h1>Terminology</h1>
        </header>
        <input ref="filter" value={this.state.filterText} onChange={onFilterChanged} onInput={onFilterChanged}/>
        <div>
          {this.renderEntities()}
        </div>
      </div>
    );
  }
}


const MyApp = mixinReactMeteorData(AppComponent);

this.MyApp = MyApp;