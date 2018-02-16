import { AssetLoader } from '../helpers/asset-loader';
import { TextureAtlas } from '../render/texture-atlas';
import { BaseLoader, IRemoteResourceLoader } from './remote-resource.loader';
import { TextureAtlasData } from './texture-atlas.data';

export class TextureAtlasLoader extends BaseLoader implements IRemoteResourceLoader<TextureAtlas> {
  load(data: TextureAtlasData): Promise<TextureAtlas> {
    return new Promise<TextureAtlas>((resolve: any, reject: any) => {
      const texture = new TextureAtlas();

      const image = new Image();
      image.onload = event => {
        texture.loadFromImage(image);
        console.log(`Texture '${data.imageFileSrc}' loaded, width: ${image.width}, height: ${image.height}`);
        AssetLoader.getTextFromUrl(data.atlasFileSrc)
          .then(result => {
            texture.loadRegionInfo(result);
            resolve(texture);
          })
          .catch(error => reject(error));
      };
      image.onerror = error => reject(error);

      image.src = data.imageFileSrc;
    });
  }
}
