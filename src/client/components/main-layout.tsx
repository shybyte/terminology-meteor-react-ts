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
                {navItem('entityList', 'Overview')}
                {navItem('entityCreate', 'New Term')}
                {navItem('fieldList', 'Fields')}
                {navItem('fieldCreate', 'New Field')}
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