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

    if (colName === 'score') {
      return value;
    }

    const field = _.find(fields, f => f.name === colName || f.backwardName === colName);

    if (!field) {
      return 'nofield';
    }

    switch (field.type) {
      case FIELD_TYPES.PICK_LIST:
        const values = value as string[];
        return ul({},
          values.map((value, i) =>
            li({key: i + ''}, value + '')
          ));
      case FIELD_TYPES.REFERENCE:
        const refValues = value as MiniEntity[];
        return ul({},
          refValues.map((e) =>
            li({key: e._id},
              a({href: FlowRouter.path('edit', {entityId: e._id})}, e.name)
            )
          ));
      case FIELD_TYPES.TEXT:
      default:
        return value;
    }
  }

  onClickDelete(ev: React.SyntheticEvent, entity: EntitySearchResult) {
    ev.preventDefault();
    serverProxy.deleteEntity(entity.__originalId);
  }


  render() {
    const p: EntityRowProps = this.props;
    return tr({key: p.entity._id},
      (<td>
        <div className="btn-group">
          <button type="button" className="btn btn-default iconButton dropdown-toggle" data-toggle="dropdown" aria-haspopup="true"
                  aria-expanded="false">
            <span className="glyphicon glyphicon-option-vertical" title="Actions"></span></button>
          <ul className="dropdown-menu dropdown-menu">
            <li>
              <a href="#" onClick={ev => this.onClickDelete(ev,p.entity)}>Delete</a>
            </li>
          </ul>
        </div>
      </td>),
    p.activeColumns.map(colName => td({key: colName}, this.renderCell(colName)))
  )
    ;
  }
}

this.EntityRow = EntityRow;