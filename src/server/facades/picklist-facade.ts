/// <reference path="../../../typings/meteor-typescript-libs/meteor.d.ts" />


function addToParent(pickList: PickList, parentItem: PickListItem, newName: string) {
  parentItem.items = (parentItem.items || []).concat({name: newName, items: []});
  PickLists.update(pickList._id, pickList);
}

const PickListFacade = {
  updatePickListName(_id: string, newName: string) {
    PickLists.update(_id, {$set: {name: newName}});
  },

  addPickListItemSister(pickListId: string, brotherItemId: string, newName: string): void {
    const pickList = PickLists.findOne(pickListId);
    const brotherItemWithParent = getPickListItemWithParent(pickList, brotherItemId);
    if (brotherItemWithParent) {
      const parentItem = brotherItemWithParent.parent;
      const items = parentItem.items;
      const indexOfBrother = items.indexOf(brotherItemWithParent.pickListItem);
      const newItem: PickListItem = {name: newName, items: []};
      parentItem.items = [...items.slice(0, indexOfBrother), newItem, ...items.slice(indexOfBrother)];
      PickLists.update(pickList._id, pickList);
    }
  },

  addRootPickListItem(pickListId: string, newName: string): void {
    const pickList = PickLists.findOne(pickListId);
    pickList.items.push({name: newName, items: []});
    PickLists.update(pickList._id, pickList);
  },

  addPickListItemChild(pickListId: string, parentItemId: string, newName: string): void {
    const pickList = PickLists.findOne(pickListId);
    const parentItem = getPickListItem(pickList, parentItemId);
    if (parentItem) {
      addToParent(pickList, parentItem, newName);
    }
  },

  deletePickListItem(pickListId: string, parentItemName: string) {
    const pickList = PickLists.findOne(pickListId);
    const itemWithParent = getPickListItemWithParent(pickList, parentItemName);
    if (itemWithParent) {
      const parentItem = itemWithParent.parent;
      parentItem.items = _.without(parentItem.items, itemWithParent.pickListItem);
      PickLists.update(pickList._id, pickList);
      EntitiesFacade.removePickListItem(pickList, itemWithParent.pickListItem);
    }
  },

  addPickList(name: string) {
    PickLists.insert({
      name,
      items: []
    });
  },

  deletePickList(_id: string) {
    const usedInFields = DataCategories.find({pickListId: _id}).fetch();
    if (usedInFields.length > 0) {
      console.error('deletePickList failed because picklist is used', _id, usedInFields);
      return;
    }
    PickLists.remove(_id);
  }
};


this.PickListFacade = PickListFacade;