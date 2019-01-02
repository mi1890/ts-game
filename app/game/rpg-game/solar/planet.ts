import { Vector4 } from '../../../engine/math/vector4';
import { Sprite } from '../../../engine/scene/sprite';
import { Text } from '../../../engine/scene/text';
import { GLOBAL } from '../global';
import { SolarBase } from './solar.base';

export class Planet extends SolarBase {
  static buildPlanet1(): Planet {
    const planet = new Planet();
    planet.initialize();
    planet.sprite.position.set(500, 500, 5);
    planet.sprite.setVerticesColor(new Vector4(29 / 255.0, 172 / 255.0, 109 / 255.0, 1.0));
    planet.text.text = 'Земля';
    return planet;
  }

  text: Text;

  initialize(): void {
    super.initialize();

    const planetTextureRegion = GLOBAL.assets.solarAtlas.getRegion('circle_bordered.png');

    this.sprite = new Sprite();
    this.sprite.setTextureRegion(planetTextureRegion, false);
    this.sprite.setSize(128, 128);

    this.text = new Text();
    this.text.pivotPoint.set(0.5, 0.0);
    this.text.parent = this.sprite;
    this.text.position.set(0, 70, 6);
    this.text.color = new Vector4(0.9, 0.9, 0.9, 1.0);
  }

  getTextsToRender(): Text[] {
    return [this.text];
  }
}