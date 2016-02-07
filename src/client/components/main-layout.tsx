function navItemClass(routeName: string) {
  return (routeName === FlowRouter.getRouteName()) ? 'active' : '';
}

function navItem(routeName: string, label: string) {
  const url = FlowRouter.path(routeName);
  return <li className={navItemClass(routeName)}>
    <a href={url}>{label}</a>
  </li>;
}

class MainLayout extends React.Component<{content: any}, {}> {
  render() {
    return (
      <div className="app">
        <header>
          <h1>Terminology</h1>
        </header>
        <div className="container-fluid">
          <div className="row">
            <nav className="col-md-1">
              <ul className="nav nav-pills nav-stacked">
                {navItem(ROUTE_NAMES.termList, 'Terms')}
                {navItem(ROUTE_NAMES.conceptList, 'Concepts')}
                {navItem(ROUTE_NAMES.entityCreate, 'New Term')}
                {navItem(ROUTE_NAMES.conceptCreate, 'New Concept')}
                {navItem(ROUTE_NAMES.fieldList, 'Fields')}
                {navItem(ROUTE_NAMES.pickListOverview, 'Pick Lists')}
                {navItem(ROUTE_NAMES.commandLog, 'Changes')}
              </ul>
            </nav>
            <main className="col-md-11">
              {this.props.content}
            </main>
          </div>
        </div>
      </div>
    );
  }
}

this.MainLayout = MainLayout;