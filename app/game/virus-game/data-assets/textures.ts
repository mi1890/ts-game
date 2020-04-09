import { TextureAtlasData } from '../../../engine/loaders/texture-atlas.data';
import { TextureFilter } from '../../../engine/render/webgl-types';

export const DEFAULT_ATLAS_DATA: TextureAtlasData = {
  imageFileSrc: 'assets/atlas.png',
  atlasFileSrc: 'assets/atlas.atlas',
  filter: TextureFilter.Nearest,
  anisotropic: 0,
};
