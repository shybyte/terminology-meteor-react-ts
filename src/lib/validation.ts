function assertNotEmpty(s: string, stringName: string) {
  if (isEmpty(s)) {
    throw new Error(`${stringName} should not be empty.`);
  }
}


function assertValidNewPickListName(newName: string) {
  assertNotEmpty(newName, 'pick list name');
  if (PickLists.findOne({name: newName})) {
    throw new Error(`Pick list with name ${newName} exist already.`);
  }
}


function existPickListItemAlready(pickList: PickList, name: string) {
  return !!getPickListItem(pickList, name);
}

function assertValidNewPickListItemName(pickList: PickList, newName: string) {
  assertNotEmpty(newName, 'pick list item name');
  if (existPickListItemAlready(pickList, newName)) {
    throw new Error(`Pick list item with name ${newName} exist already.`);
  }
}


this.assertNotEmpty = assertNotEmpty;
this.assertValidNewPickListName = assertValidNewPickListName;
this.existPickListItemAlready = existPickListItemAlready;
this.assertValidNewPickListItemName = assertValidNewPickListItemName;