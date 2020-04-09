import { ActionManager } from '../../engine/helpers/action-manager/action-manager';
import { INPUT } from '../../engine/input/input';
import { Keys, MouseButtons } from '../../engine/input/keys.enum';
import { Vector2 } from '../../engine/math/vector2';
import { Vector3 } from '../../engine/math/vector3';
import { Material } from '../../engine/render/material';
import { ShaderProgram, ShaderType } from '../../engine/render/shader-program';
import { Texture } from '../../engine/render/texture';
import { TextureAtlas } from '../../engine/render/texture-atlas';
import { SpriteBatch } from '../../engine/render2d/sprite-batch';
import { Camera, CameraPivot, CameraProjectionMode } from '../../engine/scene/camera';
import { Sprite } from '../../engine/scene/sprite';
import { AudioManager } from '../../engine/sound/audio-manager';
import { GameBase } from './../../engine/game-base';
import { Assets } from './assets';
import { BulletManager } from './bullet-manager';
import { LEVEL_DATA } from './data-assets/level.data';
import { EnemyManager } from './enemy-manager';
import { GAME_STATE, GameState } from './game-state';
import { Level } from './level';
import { PickupManager } from './pickup-manager';
import { Player } from './player';

export class Game extends GameBase {
  spriteBatch: SpriteBatch = new SpriteBatch();
  spriteBatch2: SpriteBatch = new SpriteBatch();
  text: Text = new Text();

  camera: Camera = new Camera();
  assets: Assets = new Assets();
  player: Player = new Player();
  level: Level = new Level();
  bulletManager: BulletManager;
  enemyManager: EnemyManager;
  pickupManager: PickupManager;
  audioManager: AudioManager = new AudioManager();
  actionManager: ActionManager = new ActionManager();

  screenSprite: Sprite;
  screenSpriteAlpha: number = 0;

  private ready: boolean = false;

  private gameOver: boolean = false;

  protected async onInit(): Promise<void> {
    this.player.body.position.set(this.renderer.width / 2, this.renderer.height / 2, 1);
    this.assets.loadAll()
      .then(() => {
        this.player.weapon.setTextureRegion(this.assets.textureAtlas.getRegion('pistol2.png'), true);
        this.player.weapon.multSize(2);

        this.level.material = this.assets.material;
        this.level.loadFromData(LEVEL_DATA[0]);
        this.player.body.position.set(this.level.playerStartPosition);

        this.bulletManager = new BulletManager(this.assets.textureAtlas.getRegion('bullet1.png'));

        this.enemyManager = new EnemyManager([
          this.assets.textureAtlas.getRegion('enemy1.png'),
          this.assets.textureAtlas.getRegion('enemy2.png'),
          this.assets.textureAtlas.getRegion('enemy3.png'),
        ]);

        this.pickupManager = new PickupManager(
          [
            this.assets.textureAtlas.getRegion('gold2_1.png'),
            this.assets.textureAtlas.getRegion('gold2_2.png'),
            this.assets.textureAtlas.getRegion('gold2_3.png'),
            this.assets.textureAtlas.getRegion('gold2_4.png'),
          ],
          this.assets.textureAtlas.getRegion('health1.png'),
        );

        this.screenSprite = new Sprite(this.renderer.width, this.renderer.height, new Vector2(0, 0));
        this.screenSprite.position.set(0, 0, 50);

        for (const soundName in this.assets.sounds) {
          this.audioManager.addSound(this.assets.sounds[soundName], soundName);
        }

        GAME_STATE.currentLevel = this.level;
        GAME_STATE.bulletManager = this.bulletManager;
        GAME_STATE.enemyManager = this.enemyManager;
        GAME_STATE.player = this.player;
        GAME_STATE.pickupManager = this.pickupManager;
        GAME_STATE.audioManager = this.audioManager;

        this.ready = true;
      });

    this.renderer.setClearColorRGB(0.1, 0.2, 0.2, 0.5);
    this.audioManager.masterVolume = 0;
  }

  protected onUpdate(deltaTime: number): void {
    if (!this.ready) { return; }

    if (this.gameOver) {
      if (this.screenSpriteAlpha < 1) {
        this.screenSprite.setVerticesAlpha(this.screenSpriteAlpha += deltaTime * 0.3);
      }

      if (this.gameOver && INPUT.isKeyDown[Keys.Return]) {
        document.location.reload();
      }
    } else {
      this.player.onUpdate(deltaTime);
      this.bulletManager.update(deltaTime);
      this.enemyManager.update(deltaTime);
      this.pickupManager.update(deltaTime);
      this.actionManager.update(deltaTime);

      if (this.player.health <= 0 && !this.gameOver) {
        this.gameOver = true;
        const element = document.getElementById('gameOver') as HTMLElement;
        element.style.display = 'block';
      }
    }
  }

  protected onRender(): void {
    if (!this.ready) { return; }

    super.onRender();

    this.camera.update();

    this.assets.material.bind();
    this.level.draw();
    this.bulletManager.draw();
    this.enemyManager.draw();
    this.pickupManager.draw();

    this.spriteBatch2.start();
    this.spriteBatch2.drawSingle(this.player.weapon);
    this.spriteBatch2.finish();

    this.assets.characterMaterial.bind();
    this.spriteBatch.start();
    this.spriteBatch.drawSingle(this.player.body);
    this.spriteBatch.finish();

    if (this.gameOver) {
      this.assets.noTextureMaterial.bind();
      this.spriteBatch.start();
      this.spriteBatch.drawSingle(this.screenSprite);
      this.spriteBatch.finish();
    }
  }

  protected onMouseMove(position: Vector2): void {
    this.player.onMouseMove(position);
    // nothing
  }

  protected onMouseDown(position: Vector2, button: MouseButtons): void {
    // this.pauseAll = !this.pauseAll;
  }

  protected onMouseUp(position: Vector2, button: MouseButtons): void {
    // nothing
  }

  protected onKeyDown(key: Keys): void {
    // nothing
  }
  protected onKeyUp(key: Keys): void {
    // nothing
  }
}
