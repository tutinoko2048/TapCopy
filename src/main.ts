// @ts-check

import { world, GameMode, system, CustomCommandParamType, ItemType, CustomCommandStatus, CommandPermissionLevel, Player, EquipmentSlot, ItemStack } from '@minecraft/server';

const DEFAULT_ITEM_ID = 'minecraft:compass';

let currentToolId: string;

world.afterEvents.worldLoad.subscribe(() => {
  currentToolId = world.getDynamicProperty('toolId') as string ?? DEFAULT_ITEM_ID;
});

world.beforeEvents.playerInteractWithBlock.subscribe(ev => {
  const { player, itemStack, block, isFirstEvent } = ev;

  if (
    isFirstEvent &&
    itemStack?.typeId === currentToolId &&
    player.getGameMode() === GameMode.Creative
  ) {
    ev.cancel = true;

    const stack = block.getItemStack(1, player.isSneaking);
    if (!stack) return;

    const { container } = player.getComponent('minecraft:inventory')!;

    system.run(() => {
      container.addItem(stack);
    });
  }
});

system.beforeEvents.startup.subscribe(ev => {
  ev.customCommandRegistry.registerCommand({
    name: 'tapcopy:settool',
    description: 'TapCopyで使用するツールのアイテムを設定します',
    permissionLevel: CommandPermissionLevel.GameDirectors,
    optionalParameters: [
      {
        name: 'item',
        type: CustomCommandParamType.ItemType
      }
    ]
  }, (origin, itemType?: ItemType) => {
    if (!(origin.sourceEntity instanceof Player)) {
      return {
        status: CustomCommandStatus.Failure,
        message: 'このコマンドはプレイヤーからのみ実行できます',
      };
    }

    const player = origin.sourceEntity;

    let itemId: string | undefined;
    if (itemType) {
      itemId = itemType.id;
    } else {
      const heldItem = player.getComponent('minecraft:equippable')!.getEquipment(EquipmentSlot.Mainhand);
      itemId = heldItem?.typeId;
    }

    currentToolId = itemId ?? DEFAULT_ITEM_ID;
    world.setDynamicProperty('toolId', currentToolId); // undefinedの場合はデフォルトにする

    const itemName = new ItemStack(itemId ?? DEFAULT_ITEM_ID).localizationKey;

    return {
      status: CustomCommandStatus.Success,
      message: `ツールを %${itemName} に設定しました`,
    };
  });

  ev.customCommandRegistry.registerCommand({
    name: 'tapcopy:gettool',
    description: 'TapCopyで使用するツールのアイテムを取得します',
    permissionLevel: CommandPermissionLevel.Any,
  }, (origin) => {
    if (!(origin.sourceEntity instanceof Player)) {
      return {
        status: CustomCommandStatus.Failure,
        message: 'このコマンドはプレイヤーからのみ実行できます',
      };
    }

    const player = origin.sourceEntity;

    if (player.getGameMode() !== GameMode.Creative) {
      return {
        status: CustomCommandStatus.Failure,
        message: 'このコマンドはクリエイティブモードでのみ実行できます',
      };
    }

    const itemStack = new ItemStack(currentToolId, 1);
    const { container } = player.getComponent('minecraft:inventory')!;

    system.run(() => {
      container.addItem(itemStack);
    });

    return {
      status: CustomCommandStatus.Success,
      message: 'ツールを取得しました',
    }
  });
});
