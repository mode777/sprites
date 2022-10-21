export class Texture {

  public static async load(gl: WebGLRenderingContext, path: string) {
    const img = new Image();
    const promise = new Promise<void>((res, rej) => {
      img.onload = () => res();
      img.onerror = e => rej(e);
    });
    img.src = path;
    await promise;
    const tex = new Texture(gl);
    tex.loadImage(img)
    return tex;
  }

  public static create(gl: WebGLRenderingContext, width: number, height: number){
    const tex = new Texture(gl)
    tex.createSize(width, height)
    return tex
  }

  public readonly texture: WebGLTexture;
  public width: number;
  public height: number;

  private constructor(private gl: WebGLRenderingContext) {
    this.texture = gl.createTexture()
  }

  private setFilter(){
    const gl = this.gl
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  }

  private loadImage(bitmap: HTMLImageElement){
    const gl = this.gl
    this.width = bitmap.width;
    this.height = bitmap.height;
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bitmap);
    this.setFilter()
  }

  private createSize(width: number, height: number){
    const gl = this.gl
    this.width = width
    this.height = height
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
    this.setFilter()
  }
}
