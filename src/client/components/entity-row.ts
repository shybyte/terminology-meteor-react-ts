/// <reference path="../../../typings/react/react-global.d.ts" />
const div = React.DOM.div;

interface HelloWorldProps {
  key: string;
  entity: Entity;
}

class EntityRow extends React.Component<HelloWorldProps, {}> {
  render() {
    const p: HelloWorldProps = this.props;
    return (
      div({}, p.entity.name)
    );
  }
}

this.EntityRow = EntityRow;