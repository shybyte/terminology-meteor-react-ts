/// <reference path="../../../../typings/react/react-global.d.ts" />
const tr = React.DOM.tr;
const td = React.DOM.td;
const a = React.DOM.a;
const ul = React.DOM.div;
const li = React.DOM.div;

interface EntityRowProps {
  key: string;
  entity: Entity;
  activeColumns: string[];
}

class EntityRow extends React.Component<EntityRowProps, {}> {

  renderCell(colName: string): any {
    const {entity} = this.props;
    const value = entity[colName];
    if (colName === 'name') {
      return a({href: FlowRouter.path('edit', {entityId: entity._id})}, value);
    } else if (Array.isArray(value)) {
      const values = value as any[];
      return ul({},
        values.map((e, i) =>
          li({key: i + ''},
            a({href: FlowRouter.path('edit', {entityId: e._id})}, e.name)
          )
        ));
    } else {
      return value;
    }
  }


  render() {
    const p: EntityRowProps = this.props;
    return tr({key: p.entity._id},
      p.activeColumns.map(colName => td({key: colName}, this.renderCell(colName)))
    );
  }
}

this.EntityRow = EntityRow;