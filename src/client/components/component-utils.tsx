function renderPickListItem(option: PickListSelectOption) {
  const paddingLeft = option.level * 10 + 'px';
  return <span style={{ paddingLeft: paddingLeft }}>{option.label}</span>;
}

function renderReferenceReactSelectValue({entity}: MiniEntitySelectOption) {
  const href = FlowRouter.path('edit', {entityId: entity._id});
  // FIXME: Click on Link opens first the selector, second click works.
  return <a href={href}>{entity.name}</a>;
}

function renderErrorMessage(errorMessage: string) {
  return <div className="alert alert-warning" role="alert">
    {errorMessage}
  </div>;
}

this.renderPickListItem = renderPickListItem;
this.renderReferenceReactSelectValue = renderReferenceReactSelectValue;
this.renderErrorMessage = renderErrorMessage;