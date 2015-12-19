/// <reference path="../../typings/flow-router.d.ts" />


Meteor.subscribe('dataCategories');

FlowRouter.route('/', {
  name: 'entityList',
  action() {
    ReactLayout.render(MainLayout, {content: <EntityList />});
  }
});


FlowRouter.route('/edit/:entityId', {
  name: 'edit',
  action(params: any) {
    ReactLayout.render(MainLayout, {content: <EditEntity entityId={params.entityId} />});
  }
});

FlowRouter.notFound = {
  action() {
    FlowRouter.go("/");
  }
};

