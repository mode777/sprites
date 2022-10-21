export class Texture {

  public static async load(gl: WebGLRenderingContext, path: string) {
    const img = new Image();
    const promise = new Promise<void>((res, rej) => {
      img.onload = () => res();
      img.onerror = e => rej(e);
    });
    img.src = path;
    await promise;
    return new Texture(gl, img);
  }

  public readonly texture: WebGLTexture;
  public readonly width: number;
  public readonly height: number;

  constructor(private readonly gl: WebGLRenderingContext, bitmap: HTMLImageElement) {
    this.width = bitmap.width;
    this.height = bitmap.height;
    this.texture = this.gl.createTexture();
    this.gl.bindTexture(gl.TEXTURE_2D, this.texture);
    this.gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bitmap);
    this.gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    this.gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  }
}
