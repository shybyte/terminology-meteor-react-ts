interface PickListSelectOption {
  value: string;
  label: string;
  level: number;
}

function createSelectOptionsFromPickList(pickList: PickList, level = 0): PickListSelectOption[] {
  return _.flatten(pickList.items.map(pickListItem => {
    const selectOption = {
      value: pickListItem.name,
      label: pickListItem.name,
      level: level
    };
    return [selectOption].concat(createSelectOptionsFromPickList(pickListItem, level + 1));
  }));
}

this.createSelectOptionsFromPickList = createSelectOptionsFromPickList;