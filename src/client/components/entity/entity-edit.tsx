/// <reference path="../../../../typings/react/react-global.d.ts" />
/// <reference path="../../../../typings/meteor-hacks.d.ts" />

interface EditEntityComponentProps {
  entityId: string;
}

interface EditEntityComponentData {
  entity: Entity;
}

class EditEntityComponent extends MeteorDataComponent<EditEntityComponentProps, {}, EditEntityComponentData> implements GetMeteorDataInterface<EditEntityComponentData> {
  getMeteorData() {
    return {
      entity: Entities.findOne(this.props.entityId)
    };
  }

  componentDidMount() {
    Meteor.subscribe(PUBLICATIONS.entity, {_id: this.props.entityId});
  }

  render() {
    return <EntityCreateEdit entity={this.data.entity}/>;
  }

}

const EditEntity = mixinReactMeteorData(EditEntityComponent);
this.EditEntity = EditEntity;