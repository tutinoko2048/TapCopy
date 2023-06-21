// @ts-check

import { world, Player, GameMode } from '@minecraft/server';
import { ITEM_ID } from './config.js';

/** @typedef {import('@minecraft/server').EntityInventoryComponent} Inventory */

world.afterEvents.itemUseOn.subscribe(ev => {
  const { itemStack, source, block } = ev;
  
  if (
    itemStack.typeId === ITEM_ID &&
    source instanceof Player &&
    getGamemode(source) === GameMode.creative
  ) {
    const stack = block.getItemStack(1, source.isSneaking);
    const { container } = /** @type {Inventory} */ (source.getComponent('minecraft:inventory'));
    container.addItem(stack);
  }
});

/**
 * @param {Player} player
 * @returns {GameMode|undefined}
 */
function getGamemode(player) {
  for (const gamemodeName in GameMode) {
    if (world.getPlayers({ name: player.name, gameMode: GameMode[gamemodeName] }).length > 0) {
      return GameMode[gamemodeName];
    }
  }
}
