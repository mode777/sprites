import { Texture } from './texture';

export class Tileset {

  static async load(gl: WebGLRenderingContext, path: string, tileWidth: number, tileHeight: number){
    const t = await Texture.load(gl, path)
    const ts = new Tileset(t, tileWidth, tileHeight)
    ts.filename = path
    return ts
  }

  public readonly width: number
  public readonly height: number
  public filename: string

  constructor(public readonly texture: Texture, public readonly tileWidth: number, public readonly tileHeight: number) {
    this.width = Math.floor(texture.width / tileWidth);
    this.height = Math.floor(texture.height / tileHeight);
  }

  public coordinates(tileId: number) {
    if(tileId === 0) return null
    const cleared = (tileId-1) & 68719476735;
    const x = cleared % this.width;
    const y = Math.floor(cleared / this.width);
    return [x * this.tileWidth, y * this.tileWidth, this.tileWidth, this.tileHeight];
  }

}
