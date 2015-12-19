function navItemClass(routeName: string) {
  return (routeName === FlowRouter.getRouteName()) ? 'active' : '';
}


class MainLayout extends React.Component<{content: any}, {}> {
  render() {
    const entityListUrl = FlowRouter.path('entityList');
    return (
      <div className="app">
        <header>
          <h1>Terminology</h1>
        </header>
        <div className="container-fluid">
          <div className="row">
            <nav className="col-md-1">
              <ul className="nav nav-pills nav-stacked">
                <li className={navItemClass('entityList')}>
                  <a href={entityListUrl}>Overview</a>
                </li>
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