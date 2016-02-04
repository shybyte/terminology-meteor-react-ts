/// <reference path="../../../../typings/react/react-global.d.ts" />
/// <reference path="../../../../typings/meteor-hacks.d.ts" />

interface EditEntityComponentProps {
  entityId: string;
}

interface EditEntityComponentData {
  entity: Entity;
}

class EditEntityComponent extends MeteorDataComponent<EditEntityComponentProps, {}, EditEntityComponentData> implements GetMeteorDataInterface<EditEntityComponentData> {
  subscription: Meteor.SubscriptionHandle;

  getMeteorData() {
    return {
      entity: Entities.findOne(this.props.entityId)
    };
  }

  componentDidMount() {
    this.subscribe(this.props.entityId);
  }

  componentWillUnmount() {
    this.clearSubscription();
  }

  componentWillReceiveProps(nextProps: EditEntityComponentProps) {
    this.subscribe(nextProps.entityId);
  }

  subscribe(entityId: string) {
    this.clearSubscription();
    this.subscription = Meteor.subscribe(PUBLICATIONS.entity, {_id: entityId});
  }

  clearSubscription () {
    if (this.subscription) {
      this.subscription.stop();
      this.subscription = null;
    }
  }


  render() {
    return <EntityCreateEdit entity={this.data.entity}/>;
  }

}

const EditEntity = mixinReactMeteorData(EditEntityComponent);
this.EditEntity = EditEntity;