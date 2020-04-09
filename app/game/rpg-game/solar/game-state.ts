import { ActionManager } from '../../../engine/helpers/action-manager/action-manager';
import { Vector2 } from '../../../engine/math/vector2';
import { PLAYER_DATA_START } from '../data-assets/player-data.const';
import { PlayerData } from '../player-data';
import { Enemy } from './enemy';
import { Planet } from './planet';
import { Player } from './player';
import { TargetCursor } from './target-cursor';
import { Treasure } from './treasure';

export class GameState {
  playerData: PlayerData;

  player: Player;
  targetCursor: TargetCursor;

  planets: Planet[];

  enemies: Enemy[];

  treasures: Treasure[];

  planetToLand: Planet | undefined;

  enemyToFight: Enemy | undefined;

  treasureToGet: Treasure | undefined;

  actionManager: ActionManager;

  reset(): void {
    this.playerData = PLAYER_DATA_START;

    this.player = Player.buildPlayer();
    this.targetCursor = TargetCursor.build();
    this.planetToLand = undefined;
    this.enemyToFight = undefined;

    this.planets = [
      Planet.buildPlanet1(),
      Planet.buildPlanet2(),
    ];

    this.enemies = [];
    this.treasures = [];

    this.actionManager = new ActionManager();

    this.createStartEnemies();
    this.createStartTreasures();
  }

  private createStartEnemies(): void {
    for (let i = 0; i < 10; ++i) {
      const angle = 360 * Math.random();
      const length = 300 + 300 * Math.random();

      const position = Vector2.fromAngle(angle).multiplyNumSelf(length).addToSelf(GAME_STATE.player.sprite.position);

      const enemy = Enemy.buildEnemy(position, 0.3 * Math.random());

      this.enemies.push(enemy);
    }
  }

  private createStartTreasures(): void {
    for (let i = 0; i < 5; ++i) {
      const angle = 360 * Math.random();
      const length = 500 + 300 * Math.random();

      const position = Vector2.fromAngle(angle).multiplyNumSelf(length).addToSelf(GAME_STATE.player.sprite.position);

      const treasure = Treasure.buildTreasure(position, 0.3 * Math.random());

      this.treasures.push(treasure);
    }
  }
}

export const GAME_STATE = new GameState();
