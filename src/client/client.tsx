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
  fieldCreate: 'fieldCreate',
  pickListOverview: 'pickListOverview',
  pickListEdit: 'pickListEdit',
  commandLog: 'commandLog'
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

FlowRouter.route('/edit-pick-list/:pickListId', {
  name: ROUTE_NAMES.pickListEdit,
  action(params: any) {
    ReactLayout.render(MainLayout, {content: <PickListEdit pickListId={params.pickListId}/>});
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


FlowRouter.route('/picklists', {
  name: ROUTE_NAMES.pickListOverview,
  action() {
    ReactLayout.render(MainLayout, {content: <PickListOverview />});
  }
});

FlowRouter.route('/command-log', {
  name: ROUTE_NAMES.commandLog,
  action() {
    ReactLayout.render(MainLayout, {content: <CommandLogComponent />});
  }
});

FlowRouter.notFound = {
  action() {
    FlowRouter.go("/");
  }
};


this.ROUTE_NAMES = ROUTE_NAMES;