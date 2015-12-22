/// <reference path="../../../../typings/react/react-global.d.ts" />
const tr = React.DOM.tr;
const td = React.DOM.td;
const a = React.DOM.a;

interface EntityRowProps {
  key: string;
  entity: Entity;
  activeColumns: string[];
}

class EntityRow extends React.Component<EntityRowProps, {}> {

  renderCell(colName: string) {
    const {entity} = this.props;
    if (colName === 'name') {
      return a({href: FlowRouter.path('edit', {entityId: entity._id})}, entity[colName]);
    }
    return entity[colName];
  }


  render() {
    const p: EntityRowProps = this.props;
    return tr({key: p.entity._id},
      p.activeColumns.map(colName => td({key: colName}, this.renderCell(colName)))
    );
  }
}

this.EntityRow = EntityRow;