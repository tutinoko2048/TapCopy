// @ts-check

import { world, GameMode, system } from '@minecraft/server';
import { ITEM_ID } from './config';

/** @typedef {import('@minecraft/server').EntityInventoryComponent} Inventory */

/** @type {Map<string, number>} */
const useOnHistory = new Map();

world.beforeEvents.itemUseOn.subscribe(async ev => {
  const { itemStack, source, block } = ev;

  if (
    itemStack.typeId === ITEM_ID &&
    system.currentTick - (useOnHistory.get(source.id) ?? 0) > 10 &&
    source.getGameMode() === GameMode.creative
  ) {
    ev.cancel = true;
    await null;

    const stack = block.getItemStack(1, source.isSneaking);
    if (!stack) return;
    const { container } = /** @type {Inventory} */ (source.getComponent('minecraft:inventory'));
    container?.addItem(stack);
    useOnHistory.set(source.id, system.currentTick);
  }
});

world.afterEvents.playerLeave.subscribe(({ playerId }) => useOnHistory.delete(playerId));
