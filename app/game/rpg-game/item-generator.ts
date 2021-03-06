import { ConsumableItemType, InventoryItemData, ItemRarity, ItemType } from './player-data';

export class ItemGenerator {
  static generate(type: ItemType, lucky: number): InventoryItemData {
    const itemData: InventoryItemData = {
      type,
      cost: 0,
      rarity: this.getRarity(type, lucky),
      name: '',
    };

    switch (type) {
      case ItemType.Weapon:
        this.generateWeaponForItem(itemData, lucky);
        break;

      case ItemType.Shield:
        this.generateShieldForItem(itemData, lucky);
        break;

      case ItemType.Misc:
        this.generateMiscForItem(itemData, lucky);
        break;

      case ItemType.Consumable:
        this.generateConsumableForItem(itemData, lucky);
        break;

      default:
        throw new Error(`Type ${type} is not supported`);
    }

    this.updateCost(itemData);
    return itemData;
  }

  static generateConsumable(consType: ConsumableItemType, count: number): InventoryItemData {
    const consumableInfo = CONSUMABLE.filter(it => it.type === consType)[0];
    const result: InventoryItemData = {
      consumable: {
        type: consumableInfo.type,
        count,
      },
      cost: count * consumableInfo.cost,
      rarity: ItemRarity.Special,
      type: ItemType.Consumable,
      name: consumableInfo.name,
    };

    return result;
  }

  private static getRarity(type: ItemType, lucky: number): ItemRarity {
    if (type === ItemType.Consumable) { return ItemRarity.Special; }
    if (type === ItemType.Misc) { return ItemRarity.Usual; }

    if (lucky < 0.6) { return ItemRarity.Usual; }
    if (lucky < 0.9) { return ItemRarity.Special; }
    return ItemRarity.Legendary;
  }

  private static updateCost(itemData: InventoryItemData): void {
    let rarityMultiplier = 1.0;
    if (itemData.rarity === ItemRarity.Special) {
      rarityMultiplier = 1.5;
    } else if (itemData.rarity === ItemRarity.Legendary) {
      rarityMultiplier = 3;
    }

    itemData.cost = Math.ceil(itemData.cost * rarityMultiplier);
  }

  private static generateWeaponForItem(itemData: InventoryItemData, lucky: number): void {
    let damageMultiplier = 1.0;
    let addEffects = 0;
    let name = 'Ракетница';
    if (itemData.rarity === ItemRarity.Special) {
      damageMultiplier = 1.5;
      addEffects = 2;
      name = 'Отличная ракетница';
    } else if (itemData.rarity === ItemRarity.Legendary) {
      damageMultiplier = 3;
      addEffects = 3;
      name = 'Легендарная ракетница';
    }

    const minDamage = Math.ceil(4 + 2 * Math.random() * damageMultiplier);
    const maxDamage = minDamage + Math.ceil(4 + 2 * Math.random() * damageMultiplier);

    itemData.weapon = {
      damageMin: minDamage,
      damageMax: maxDamage,
      shieldPiercing: addEffects-- > 0 && Math.random() > 0.5
        ? damageMultiplier * 0.05 + 0.15 * Math.random()
        : (addEffects++ , undefined),
      criticalChanceMultiplier: addEffects-- > 0 && Math.random() > 0.6
        ? damageMultiplier * 0.05 + 0.25 * Math.random()
        : (addEffects++ , undefined),
      addAttack: addEffects-- > 0 && Math.random() > 0.7
        ? 1
        : undefined,
    };

    itemData.name = name;

    itemData.cost = 50
      + 3 * itemData.weapon.damageMin
      + 3 * itemData.weapon.damageMax
      + (itemData.weapon.shieldPiercing || 0) * 50
      + (itemData.weapon.criticalChanceMultiplier || 0) * 70
      + (itemData.weapon.addAttack || 0) * 150;
  }

  private static generateShieldForItem(itemData: InventoryItemData, lucky: number): void {
    let shieldMultiplierBase = 0.3;
    itemData.name = 'Генератор щита';
    if (itemData.rarity === ItemRarity.Special) {
      shieldMultiplierBase = 0.4;
      itemData.name = 'Отличный генератор щита';
    } else if (itemData.rarity === ItemRarity.Legendary) {
      shieldMultiplierBase = 0.5;
      itemData.name = 'Легендарный генератор щита';
    }

    itemData.shield = {
      shieldMultiplier: shieldMultiplierBase + 0.08 * Math.random(),
      addProtect: itemData.rarity !== ItemRarity.Usual && Math.random() + lucky > 0.9 ? 1 : undefined,
    };

    itemData.cost = Math.ceil(100 + 100 * itemData.shield.shieldMultiplier + (itemData.shield.addProtect ? 200 : 0));
  }

  private static generateMiscForItem(itemData: InventoryItemData, lucky: number): void {
    itemData.misc = {
      count: Math.ceil(25 * lucky + 10 * Math.random()),
    };

    itemData.cost = 4 * itemData.misc.count;
    itemData.name = MISC_NAMES[Math.floor(MISC_NAMES.length * Math.random())];
  }

  private static generateConsumableForItem(itemData: InventoryItemData, lucky: number): void {
    const consumable = CONSUMABLE[Math.floor(CONSUMABLE.length * Math.random())];
    const count = Math.ceil(5 * lucky);
    itemData.consumable = {
      type: consumable.type,
      count,
    };
    itemData.name = consumable.name;
    itemData.cost = consumable.cost * count;
  }
}

const MISC_NAMES: string[] = [
  'Что-то вроде золота',
  'Металлолом',
  'Электроника от дяди Ляо',
  'Сомнительные энергоячейки',
  'Туалетная бумага, почти новая',
  'Корм для животных',
  'Диски с музыкой восьмидесятых',
  'Консервы времен войны',
  'Водяные чипы для убежищ',
  'Китайские запчасти на корабль',
];

const CONSUMABLE = [
  {
    type: ConsumableItemType.Heal,
    cost: 50,
    name: 'Лечение',
  },
  {
    type: ConsumableItemType.IncreaseCriticalChance,
    cost: 50,
    name: '+ Шанс крит. урона',
  },

  {
    type: ConsumableItemType.MoreProtectCount,
    cost: 50,
    name: '+1 Защита',
  },

  {
    type: ConsumableItemType.MoreAttackCount,
    cost: 50,
    name: '+1 Атака',
  },
];
