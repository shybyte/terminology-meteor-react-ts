function renderPickListItem(option: PickListSelectOption) {
  const paddingLeft = option.level * 10 + 'px';
  return <span style={{ paddingLeft: paddingLeft }}>{option.label}</span>;
}

this.renderPickListItem = renderPickListItem;