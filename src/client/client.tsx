/// <reference path="../../typings/flow-router.d.ts" />
/// <reference path="components/field/field-create.tsx" />


const fieldsSubscription = Meteor.subscribe(PUBLICATIONS.dataCategories);
const pickListsSubscription = Meteor.subscribe(PUBLICATIONS.pickLists);

FlowRouter.route('/', {
  name: 'entityList',
  action() {
    function renderIfReady() {
      if (fieldsSubscription.ready() && pickListsSubscription.ready()) {
        ReactLayout.render(MainLayout, {content: <EntityList />});
      } else {
        setTimeout(renderIfReady, 10);
      }
    }

    renderIfReady();
  }
});


FlowRouter.route('/edit/:entityId', {
  name: 'edit',
  action(params: any) {
    ReactLayout.render(MainLayout, {content: <EditEntity entityId={params.entityId}/>});
  }
});

FlowRouter.route('/create/term', {
  name: 'entityCreate',
  action() {
    ReactLayout.render(MainLayout, {content: <EntityCreate />});
  }
});


FlowRouter.route('/fields', {
  name: 'fieldList',
  action() {
    ReactLayout.render(MainLayout, {content: <FieldList />});
  }
});

FlowRouter.route('/create/field', {
  name: 'fieldCreate',
  action() {
    ReactLayout.render(MainLayout, {content: <FieldCreate />});
  }
});


FlowRouter.notFound = {
  action() {
    FlowRouter.go("/");
  }
};

