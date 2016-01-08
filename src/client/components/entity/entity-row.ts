/// <reference path="../../../../typings/react/react-global.d.ts" />
const tr = React.DOM.tr;
const td = React.DOM.td;
const a = React.DOM.a;
const ul = React.DOM.div;
const li = React.DOM.div;

interface EntityRowProps {
  key: string;
  entity: EntitySearchResult;
  activeColumns: string[];
  fields: DataCategory[];
}

class EntityRow extends React.Component<EntityRowProps, {}> {

  renderCell(colName: string): any {
    const {entity, fields} = this.props;
    const value = entity[colName];

    if (!value) {
        return '';
    }

    if (colName === 'name') {
      return a({href: FlowRouter.path('edit', {entityId: entity.__originalId})}, value);
    }

    const field = _.find(fields, f => f.name === colName || f.backwardName === colName);

    if (!field) {
      return 'nofield';
    }

    switch (field.type) {
      case FIELD_TYPES.PICK_LIST:
        const values = value as any[];
        return ul({},
          values.map((value, i) =>
            li({key: i + ''}, value + '')
          ));
      case FIELD_TYPES.REFERENCE:
        const refValues = value as any[];
        return ul({},
          refValues.map((e, i) =>
            li({key: i + ''},
              a({href: FlowRouter.path('edit', {entityId: e._id})}, e.name)
            )
          ));
      case FIELD_TYPES.TEXT:
      default:
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