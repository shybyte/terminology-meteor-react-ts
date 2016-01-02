/// <reference path="../../typings/flow-router.d.ts" />
/// <reference path="components/field/field-create.tsx" />


const fieldsSubscription = Meteor.subscribe(PUBLICATIONS.dataCategories);
const pickListsSubscription = Meteor.subscribe(PUBLICATIONS.pickLists);

const ROUTE_NAMES = {
  termList: 'termList',
  termEdit: 'edit',
  conceptList: 'conceptList',
  entityCreate: 'entityCreate',
  conceptCreate: 'conceptCreate',
  fieldList: 'fieldList',
  fieldCreate: 'fieldCreate'
};

function renderEntityList(type: string) {
  function renderIfReady() {
    if (fieldsSubscription.ready() && pickListsSubscription.ready()) {
      ReactLayout.render(MainLayout, {content: <EntityList type={type}/>});
    } else {
      setTimeout(renderIfReady, 10);
    }
  }
  renderIfReady();
}

FlowRouter.route('/', {
  name: ROUTE_NAMES.termList,
  action() {
    renderEntityList(ENTITY_TYPES.T);
  }
});

FlowRouter.route('/concepts', {
  name: ROUTE_NAMES.conceptList,
  action() {
    renderEntityList(ENTITY_TYPES.C);
  }
});


FlowRouter.route('/edit/:entityId', {
  name: ROUTE_NAMES.termEdit,
  action(params: any) {
    ReactLayout.render(MainLayout, {content: <EditEntity entityId={params.entityId}/>});
  }
});

FlowRouter.route('/create/term', {
  name: ROUTE_NAMES.entityCreate,
  action() {
    ReactLayout.render(MainLayout, {content: <EntityCreate />});
  }
});

FlowRouter.route('/create/concept', {
  name: ROUTE_NAMES.conceptCreate,
  action() {
    ReactLayout.render(MainLayout, {content: <ConceptCreate />});
  }
});


FlowRouter.route('/fields', {
  name: ROUTE_NAMES.fieldList,
  action() {
    ReactLayout.render(MainLayout, {content: <FieldList />});
  }
});

FlowRouter.route('/create/field', {
  name: ROUTE_NAMES.fieldCreate,
  action() {
    ReactLayout.render(MainLayout, {content: <FieldCreate />});
  }
});


FlowRouter.notFound = {
  action() {
    FlowRouter.go("/");
  }
};


this.ROUTE_NAMES = ROUTE_NAMES;