import { GuiButton } from '../../../engine/gui/gui-button';
import { GuiManager } from '../../../engine/gui/gui-manager';
import { Action } from '../../../engine/helpers/action-manager/action';
import { Subscription } from '../../../engine/helpers/event/subscription';
import { MenuHelper } from '../../../engine/helpers/menu/menu-helper';
import { Keys, MouseButtons } from '../../../engine/input/keys.enum';
import { Vector2 } from '../../../engine/math/vector2';
import { renderer } from '../../../engine/render/webgl';
import { SpriteBatch } from '../../../engine/render2d/sprite-batch';
import { TextBatch } from '../../../engine/render2d/text-batch';
import { Scene } from '../../../engine/scenes/scene';
import { CREDITS_GOAL } from '../assets/player-data.const';
import { SOLAR_MENU_DATA } from '../assets/solar-menu.data';
import { SOUNDS } from '../assets/sound.data';
import { FIGHT_GAME_STATE } from '../fight/game-state';
import { GLOBAL } from '../global';
import { GlobalEvents } from '../global.events';
import { PLANET_GAME_STATE } from '../planet/game-state';
import { IRenderable, RenderHelper } from '../render-helper';
import { CameraController } from '../solar/camera.controller';
import { Enemy } from '../solar/enemy';
import { GAME_STATE } from '../solar/game-state';
import { Nebula, NebulaPool } from '../solar/nebula';
import { Planet } from '../solar/planet';
import { SolarBase } from '../solar/solar.base';
import { Treasure } from '../solar/treasure';
import { TreasureType, TREASURE_GAME_STATE } from '../treasure/game-state';
import { SCENES } from './scenes.const';

export class GameScene extends Scene {
  guiManager: GuiManager;
  guiSpriteBatch: SpriteBatch;
  guiTextBatch: TextBatch;
  renderHelper: RenderHelper;

  landingButton: GuiButton;
  getTreasureButton: GuiButton;
  toPlayerButton: GuiButton;

  solarObjects: SolarBase[];

  nebulaPool: NebulaPool;

  lastPlayerMoveAction: Action;

  cameraController: CameraController;

  $takeOffFromPlanet: Subscription<void>;
  $enemyDefeated: Subscription<void>;
  $playedDied: Subscription<void>;
  $treasureGot: Subscription<void>;

  constructor() {
    super();
  }

  load(): Promise<void> {
    console.log('Game scene is loaded');

    renderer.setClearColorRGB(2 / 255, 4 / 255, 34 / 255, 1.0);

    this.renderHelper = new RenderHelper(GLOBAL.assets.font, GLOBAL.assets.solarMaterial);

    this.guiSpriteBatch = new SpriteBatch();
    this.guiTextBatch = new TextBatch(GLOBAL.assets.font);
    this.guiManager = new GuiManager(
      GLOBAL.assets.solarMaterial,
      this.guiSpriteBatch,
      this.guiTextBatch,
      GLOBAL.assets.guiCamera,
    );

    MenuHelper.loadMenu(this.guiManager, SOLAR_MENU_DATA);

    this.landingButton = this.guiManager.getElement<GuiButton>('LandingButton');
    this.landingButton.visible = false;
    this.landingButton.onClick = () => this.land();

    this.getTreasureButton = this.guiManager.getElement<GuiButton>('TreasureButton');
    this.getTreasureButton.visible = false;
    this.getTreasureButton.onClick = () => this.getTreasure();

    this.toPlayerButton = this.guiManager.getElement<GuiButton>('ToPlayerButton');
    this.toPlayerButton.visible = true;
    this.toPlayerButton.onClick = () => this.toPlayer();

    this.solarObjects = [];
    this.nebulaPool = new NebulaPool(() => Nebula.build(), 64);
    this.cameraController = new CameraController(GLOBAL.assets.gameCamera, 800);

    GAME_STATE.reset();

    this.solarObjects = this.solarObjects
      .concat(GAME_STATE.planets)
      .concat(GAME_STATE.enemies)
      .concat(GAME_STATE.treasures);

    this.solarObjects.push(
      GAME_STATE.player,
      GAME_STATE.targetCursor,
    );

    this.nebulaPool.initialize();

    this.$takeOffFromPlanet = GlobalEvents.takeOffFromPlanet.subscribe(() => this.onTakeOffFromPlanet());
    this.$enemyDefeated = GlobalEvents.enemyDefeated.subscribe(() => this.onEnemyDefeated());
    this.$playedDied = GlobalEvents.playerDied.subscribe(() => this.onPlayerDied());
    this.$treasureGot = GlobalEvents.treasureGot.subscribe(() => this.onTreasureGot());

    GLOBAL.actionManager.add(() => this.sceneManager.showModal(SCENES.start), 0.5);

    this.updateShops();

    return super.load();
  }

  unload(): Promise<void> {
    this.guiManager.free();
    this.guiTextBatch.free();
    this.guiSpriteBatch.free();
    this.renderHelper.free();
    this.$takeOffFromPlanet.unsubscribe();
    this.$enemyDefeated.unsubscribe();
    this.$playedDied.unsubscribe();
    return super.unload();
  }

  render(): void {
    GLOBAL.assets.gameCamera.update();
    this.renderHelper.render([this.nebulaPool as IRenderable].concat(this.solarObjects));
    GLOBAL.assets.guiCamera.update();
    this.guiManager.render();
  }

  update(deltaTime: number): void {
    GAME_STATE.actionManager.update(deltaTime);

    for (const solarObject of this.solarObjects) {
      solarObject.update(deltaTime);
    }

    this.cameraController.update(deltaTime);

    this.checkFight();

    this.checkMoney();
  }

  onMouseDown(position: Vector2, button: MouseButtons): void {
    if (button === Keys.LeftButton) {
      const worldPosition = GLOBAL.assets.gameCamera.screenToWorld(position);
      this.movePlayerToPosition(new Vector2().set(worldPosition));
    }
  }

  onPause(pause: boolean): void {
    super.onPause(pause);
    this.guiManager.enabled = !pause;
  }

  private onTakeOffFromPlanet(): void {
    if (!GAME_STATE.planetToLand) { return; }

    GAME_STATE.planetToLand.inventory = PLANET_GAME_STATE.planet.shopItems;
  }

  private onEnemyDefeated(): void {
    if (!GAME_STATE.enemyToFight) {
      return;
    }

    // open treasures
    TREASURE_GAME_STATE.player = GAME_STATE.playerData;
    TREASURE_GAME_STATE.treasure = {
      type: TreasureType.Enemy,
      cost: GAME_STATE.enemyToFight.power + 0.1,
      credits: GAME_STATE.enemyToFight.enemyData.credits,
    };
    this.sceneManager.showModal(SCENES.treasure, true);

    // remove enemy
    const index = GAME_STATE.enemies.indexOf(GAME_STATE.enemyToFight);
    const solarIndex = this.solarObjects.indexOf(GAME_STATE.enemyToFight);
    GAME_STATE.enemies.splice(index, 1);
    this.solarObjects.splice(solarIndex, 1);

    GAME_STATE.enemyToFight = undefined;
  }

  private onPlayerDied(): void {
    GAME_STATE.enemyToFight = undefined;
    GAME_STATE.playerData.credits = Math.floor(GAME_STATE.playerData.credits * 0.7);
    GAME_STATE.playerData.shipHealth = GAME_STATE.playerData.shipMaxHealth;

    // go to planet
    GAME_STATE.player.sprite.position.set(GAME_STATE.planets[0].sprite.position.asVector2());
    this.cameraController.camera.position.set(GAME_STATE.planets[0].sprite.position
      .asVector2()
      .subtractFromSelf(renderer.width / 2, renderer.height / 2));

    this.sceneManager.showModal(SCENES.defeated, true);
  }

  private onTreasureGot(): void {
    if (!GAME_STATE.treasureToGet) {
      return;
    }

    const index = GAME_STATE.treasures.indexOf(GAME_STATE.treasureToGet);
    const solarIndex = this.solarObjects.indexOf(GAME_STATE.treasureToGet);
    GAME_STATE.treasures.splice(index, 1);
    this.solarObjects.splice(solarIndex, 1);

    GAME_STATE.treasureToGet = undefined;
  }

  private movePlayerToPosition(position: Vector2): void {
    GAME_STATE.targetCursor.sprite.visible = true;
    GAME_STATE.targetCursor.sprite.position.set(position);
    GAME_STATE.player.sprite.rotation = position.subtract(GAME_STATE.player.sprite.position).toAngle() + 90;

    if (this.lastPlayerMoveAction) {
      this.lastPlayerMoveAction.onDeactivate();
    }

    this.lastPlayerMoveAction = GAME_STATE.actionManager
      .add((deltaTime) => {
        const moveVector = position
          .subtract(GAME_STATE.player.sprite.position);

        if (moveVector.length() < 1) {
          this.stopMoving();
          return true;
        }

        moveVector
          .normalize()
          .multiplyNumSelf(deltaTime * GAME_STATE.player.speed);

        GAME_STATE.player.sprite.position.addToSelf(moveVector);

        this.checkLanding();
        this.checkTreasure();
        return false;
      });
  }

  private stopMoving(): void {
    if (!this.lastPlayerMoveAction) {
      return;
    }

    this.lastPlayerMoveAction.onDeactivate();
    GAME_STATE.targetCursor.sprite.visible = false;
  }

  private checkLanding(): void {
    for (const planet of GAME_STATE.planets) {
      const distanceToPlayer = planet.sprite.position.subtract(GAME_STATE.player.sprite.position).lengthQ();
      if (distanceToPlayer > planet.radius * planet.radius) { continue; }

      this.setLanding(planet);

      return;
    }

    this.setLanding(undefined);
  }

  private checkFight(): void {
    for (const enemy of GAME_STATE.enemies) {
      const distanceToPlayer = enemy.sprite.position.subtract(GAME_STATE.player.sprite.position).lengthQ();
      if (distanceToPlayer > 16 * 16) { continue; }

      this.fight(enemy);
      return;
    }
  }

  private checkMoney(): void {
    if (GAME_STATE.playerData.credits >= CREDITS_GOAL) {
      this.sceneManager.showModal(SCENES.endgame);
    }
  }

  private checkTreasure(): void {
    for (const treasure of GAME_STATE.treasures) {
      const distanceToPlayer = treasure.sprite.position.subtract(GAME_STATE.player.sprite.position).lengthQ();
      if (distanceToPlayer > 400) { continue; }

      this.setTreasure(treasure);
      return;
    }

    this.setTreasure(undefined);
  }

  private setLanding(planet: Planet | undefined): void {
    if (!planet) {
      GAME_STATE.planetToLand = undefined;
      this.landingButton.visible = false;
      return;
    }

    GAME_STATE.planetToLand = planet;
    this.landingButton.visible = true;
  }

  private setTreasure(treasure: Treasure | undefined): void {
    if (!treasure) {
      GAME_STATE.treasureToGet = undefined;
      this.getTreasureButton.visible = false;
      return;
    }

    GAME_STATE.treasureToGet = treasure;
    this.getTreasureButton.visible = true;
  }

  private land(): void {
    this.lastPlayerMoveAction.onDeactivate();

    GLOBAL.assets.audioManager.playSound(SOUNDS.pickup);

    if (!GAME_STATE.planetToLand) {
      return;
    }

    PLANET_GAME_STATE.player = GAME_STATE.playerData;
    PLANET_GAME_STATE.planet = {
      shopSize: 24,
      name: GAME_STATE.planetToLand.name,
      shopItems: GAME_STATE.planetToLand.inventory,
    };

    this.sceneManager.showModal(SCENES.planet, true);
  }

  private fight(enemy: Enemy): void {
    this.stopMoving();

    GAME_STATE.enemyToFight = enemy;
    FIGHT_GAME_STATE.enemyData = enemy.enemyData;
    FIGHT_GAME_STATE.humanData = GAME_STATE.playerData;
    this.sceneManager.showModal(SCENES.fight, true);
  }

  private getTreasure(): void {
    if (!GAME_STATE.treasureToGet) {
      return;
    }

    this.stopMoving();

    TREASURE_GAME_STATE.player = GAME_STATE.playerData;
    TREASURE_GAME_STATE.treasure = {
      credits: 0,
      type: TreasureType.Chest,
      cost: GAME_STATE.treasureToGet.cost,
    };
    this.sceneManager.showModal(SCENES.treasure, true);
  }

  private toPlayer(): void {
    this.stopMoving();
    this.cameraController.moveToObject(GAME_STATE.player, 800);
  }

  private updateShops(): void {
    for (const planet of GAME_STATE.planets) {
      planet.updateInventory();
    }

    GAME_STATE.actionManager.add(() => this.updateShops(), 180);
  }
}
