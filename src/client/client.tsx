/// <reference path="../../typings/flow-router.d.ts" />


Meteor.subscribe('dataCategories');

FlowRouter.route('/', {
  name: 'entityList',
  action() {
    ReactLayout.render(MainLayout, {content: <EntityList />});
  }
});

FlowRouter.route('/fields', {
  name: 'fieldList',
  action() {
    ReactLayout.render(MainLayout, {content: <FieldList />});
  }
});




FlowRouter.route('/edit/:entityId', {
  name: 'edit',
  action(params: any) {
    ReactLayout.render(MainLayout, {content: <EditEntity entityId={params.entityId} />});
  }
});

FlowRouter.route('/create/term', {
  name: 'entityCreate',
  action() {
    ReactLayout.render(MainLayout, {content: <EntityCreate />});
  }
});


FlowRouter.notFound = {
  action() {
    FlowRouter.go("/");
  }
};

