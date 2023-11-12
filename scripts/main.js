// @ts-check

import { world, Player, GameMode } from '@minecraft/server';
import { ITEM_ID } from './config.js';

/** @typedef {import('@minecraft/server').EntityInventoryComponent} Inventory */

world.beforeEvents.itemUseOn.subscribe(async ev => {
  const { itemStack, source, block } = ev;

  if (
    itemStack.typeId === ITEM_ID &&
    getGameMode(source) === GameMode.creative
  ) {
    ev.cancel = true;
    await null;

    const stack = block.getItemStack(1, source.isSneaking);
    if (!stack) return;
    const { container } = /** @type {Inventory} */ (source.getComponent('minecraft:inventory'));
    container.addItem(stack);
  }
});

/**
 * @author tutinoko2048
 * @param { import('@minecraft/server').Player } target
 * @returns { import('@minecraft/server').GameMode }
 */
function getGameMode(target) {
  for (const key in GameMode) {
    if (target.matches({ gameMode: GameMode[key] })) return GameMode[key];
  }
}
