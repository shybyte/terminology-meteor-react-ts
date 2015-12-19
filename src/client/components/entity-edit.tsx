interface EditEntityProps {
  entityId: string;
}

class EditEntity extends React.Component<EditEntityProps, {}> {
  render() {
    return (
      <div>
        {this.props.entityId}
      </div>
    );
  }
}

this.EditEntity = EditEntity;