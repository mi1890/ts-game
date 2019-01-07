import { GuiButton } from '../../../engine/gui/gui-button';
import { GuiManager } from '../../../engine/gui/gui-manager';
import { Keys, MouseButtons } from '../../../engine/input/keys.enum';
import { Vector2 } from '../../../engine/math/vector2';
import { SpriteBatch } from '../../../engine/render2d/sprite-batch';
import { TextBatch } from '../../../engine/render2d/text-batch';
import { Scene } from '../../../engine/scenes/scene';
import { MAIN_MENU_DATA } from '../assets/main-menu.data';
import { FIGHT_GAME_STATE } from '../fight/game-state';
import { GLOBAL } from '../global';
import { MenuHelper } from '../menu/menu-helper';
import { PLANET_GAME_STATE } from '../planet/game-state';
import { ConsumableItemType } from '../player-data';
import { SCENES } from './scenes.const';

export class MainMenuScene extends Scene {
  guiManager: GuiManager;

  constructor() {
    super();
  }

  load(): Promise<void> {
    this.guiManager = new GuiManager(
      GLOBAL.assets.blankMaterial,
      new SpriteBatch(),
      new TextBatch(GLOBAL.assets.font),
      GLOBAL.assets.guiCamera,
    );

    MenuHelper.loadMenu(this.guiManager, MAIN_MENU_DATA);

    this.guiManager
      .getElement<GuiButton>('StartButton')
      .onClick = () => this.sceneManager.switchTo(SCENES.game);

    this.guiManager
      .getElement<GuiButton>('HelpButton')
      .onClick = () => this.sceneManager.switchTo(SCENES.help);

    this.guiManager
      .getElement<GuiButton>('TestFightButton')
      .onClick = () => this.testFight();

    this.guiManager
      .getElement<GuiButton>('TestPlanetButton')
      .onClick = () => this.testPlanet();

    return super.load();
  }

  unload(): Promise<void> {
    this.guiManager.free();

    return super.unload();
  }

  render(): void {
    GLOBAL.assets.guiCamera.update();
    this.guiManager.render();
  }

  update(deltaTime: number): void {
    this.guiManager.update(deltaTime);
  }

  onKeyDown(key: Keys): void {
  }

  onMouseDown(position: Vector2, button: MouseButtons): void {
  }

  onMouseMove(position: Vector2): void {
  }

  onMouseUp(position: Vector2, button: MouseButtons): void {
  }

  private testFight(): void {
    FIGHT_GAME_STATE.enemyData = {
      attackCount: 2,
      attackDamageMin: 6,
      attackDamageMax: 12,
      criticalChance: 0.1,
      cellCount: 5,
      consumableItems: [],
      protectCount: 2,
      protectMultiplier: 0.5,
      shipHealth: 100,
      shipMaxHealth: 100,
      credits: 0,
      inventorySize: 16,
    };

    FIGHT_GAME_STATE.humanData = {
      attackCount: 2,
      attackDamageMin: 6,
      attackDamageMax: 12,
      criticalChance: 0.1,
      cellCount: 5,
      consumableItems: [{
        count: 1,
        type: ConsumableItemType.IncreaseCriticalChance,
      }, {
        count: 2,
        type: ConsumableItemType.MoreProtectCount,
      }, {
        count: 2,
        type: ConsumableItemType.MoreAttackCount,
      }, {
        count: 1,
        type: ConsumableItemType.Heal,
      }],
      protectCount: 2,
      protectMultiplier: 0.5,
      shipHealth: 100,
      shipMaxHealth: 100,
      credits: 0,
      inventorySize: 16,
    };

    this.sceneManager.switchTo(SCENES.fight);
  }

  private testPlanet(): void {
    PLANET_GAME_STATE.player = {

      attackCount: 2,
      attackDamageMin: 6,
      attackDamageMax: 12,
      criticalChance: 0.1,
      cellCount: 5,
      consumableItems: [{
        count: 1,
        type: ConsumableItemType.IncreaseCriticalChance,
      }, {
        count: 2,
        type: ConsumableItemType.MoreProtectCount,
      }, {
        count: 2,
        type: ConsumableItemType.MoreAttackCount,
      }, {
        count: 1,
        type: ConsumableItemType.Heal,
      }],
      protectCount: 2,
      protectMultiplier: 0.5,
      shipHealth: 63,
      shipMaxHealth: 100,
      credits: 59,
      inventorySize: 16,
    };
    this.sceneManager.switchTo(SCENES.planet);
  }
}
