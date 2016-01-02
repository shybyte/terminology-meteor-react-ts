/// <reference path="../../../../typings/react/react-global.d.ts" />
/// <reference path="../../../../typings/meteor-hacks.d.ts" />


class ConceptCreate extends React.Component<{}, {}> {

  render() {
    const emptyEntity: EntityInsert = {name: '', type: ENTITY_TYPES.C};
    return <EntityCreateEdit entity={emptyEntity}/>;
  }
}

this.ConceptCreate = ConceptCreate;