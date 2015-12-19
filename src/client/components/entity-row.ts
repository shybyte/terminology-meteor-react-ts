/// <reference path="../../../typings/react/react-global.d.ts" />
const tr = React.DOM.tr;
const td = React.DOM.td;

interface EntityRowProps {
  key: string;
  entity: Entity;
  activeColumns: string[];
}

class EntityRow extends React.Component<EntityRowProps, {}> {
  render() {
    const p: EntityRowProps = this.props;
    return (
      tr({key: p.entity._id}, p.activeColumns.map(col => td({key: col}, p.entity[col])))
    );
  }
}

this.EntityRow = EntityRow;