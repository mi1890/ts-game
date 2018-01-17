import { Vector2 } from './math/vector';
import { WebGLRenderer } from './render/webgl-renderer';
import { ClearMask } from './render/webgl-types';

/**
 * Base game class. Developers should extend it with own descendant class with specific game logic
 */
export abstract class GameBase {
  protected renderer: WebGLRenderer;

  constructor(canvasElement: HTMLCanvasElement) {
    this.renderer = new WebGLRenderer(canvasElement);
    this.renderer.onMouseMove = position => this.onMouseMove(position);
  }

  /**
   * Game loop
   */
  public run(): void {
    this.onInit();

    const gameLoop = (timestamp: number) => {
      this.onUpdate(timestamp);
      this.onRender(timestamp);
      window.requestAnimationFrame(gameLoop);
    }

    window.requestAnimationFrame(gameLoop);
  }

  /**
   * Initialization method callback.
   * It runs once before game loop starts.
   */
  protected abstract onInit(): void;

  /**
   *
   * @param timestamp Current timestamp from start of loop
   */
  protected abstract onUpdate(timestamp: number): void;

  protected onRender(timestamp: number): void {
    this.renderer.clear(ClearMask.All);
    this.renderer.resetStates();
    this.renderer.resetStatistics();
  }

  /**
   * Mouse move callback
   * @param event MouseEvent
   */
  protected abstract onMouseMove(position: Vector2): void;
}
