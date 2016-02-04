/// <reference path="../../../typings/meteor-typescript-libs/meteor.d.ts" />


const PickListFacade = {
  updatePickListName(_id: string, newName: string) {
    PickLists.update(_id, {$set: {name: newName}});
  },

  addPickListItemSister(pickListId: string, brotherItemId: string , newName: string): void {
  },

  addPickListItemChild(pickListId: string, parentItemId: string , newName: string): void {
    const pickList = PickLists.findOne(pickListId);
    const parentItem = getPickListItem(pickList, parentItemId);

    if (!parentItem) {
      return;
    }

    parentItem.items = (parentItem.items || []).concat({name: newName, items: []});
    PickLists.update(pickListId, pickList);
  }
};


this.PickListFacade = PickListFacade;