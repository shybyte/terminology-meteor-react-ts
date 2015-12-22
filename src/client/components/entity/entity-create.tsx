/// <reference path="../../../../typings/react/react-global.d.ts" />
/// <reference path="../../../../typings/meteor-hacks.d.ts" />


class EntityCreate extends React.Component<{}, {}> {

  render() {
    const emptyEntity = {name: ''};
    return <EntityCreateEdit entity={emptyEntity}/>;
  }
}

this.EntityCreate = EntityCreate;