// @ts-check

import { world, GameMode } from '@minecraft/server';
import { ITEM_ID } from './config';

/** @typedef {import('@minecraft/server').EntityInventoryComponent} Inventory */

world.beforeEvents.itemUseOn.subscribe(async ev => {
  const { itemStack, source, block } = ev;

  if (
    itemStack.typeId === ITEM_ID &&
    source.getGameMode() === GameMode.creative
  ) {
    ev.cancel = true;
    await null;

    const stack = block.getItemStack(1, source.isSneaking);
    if (!stack) return;
    const { container } = /** @type {Inventory} */ (source.getComponent('minecraft:inventory'));
    container?.addItem(stack);
  }
});
