import { mat4, vec4 } from 'gl-matrix';
import { ShaderProgram } from './shader-program';
import { Texture } from './texture';
import { QuadBuffer } from './quad-buffer';
import { Framebuffer } from './framebuffer';
import { Camera } from './camera';

export class Renderer {

  public camera: Camera;
  public program: ShaderProgram;
  public texture: Texture;
  public clearColor: vec4;
  private projection = mat4.create();
  private model = mat4.create();
  private canvas: HTMLCanvasElement;

  constructor(private gl: WebGLRenderingContext) {
    this.canvas = <HTMLCanvasElement>gl.canvas;
    addEventListener('resize', () => this.resize());
    this.resize();
  }

  private deg2rad(deg: number) {
    return deg * (Math.PI / 180);
  }

  private resize() {
    const gl = this.gl;
    const w = document.body.clientWidth;
    const h = document.body.clientHeight;
    gl.canvas.width = w;
    gl.canvas.height = h;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    this.projection = mat4.perspective(mat4.create(), this.deg2rad(60), this.canvas.width / this.canvas.height, 0.1, 100);
  }

  bindFramebuffer(framebuffer: Framebuffer) {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer.framebuffer);
    gl.viewport(0, 0, framebuffer.texture.width, framebuffer.texture.height);
  }

  unbindFramebuffer() {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  }

  start(framebuffer?: Framebuffer) {
    const gl = this.gl;
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    framebuffer ? this.bindFramebuffer(framebuffer) : this.unbindFramebuffer();
    const [r, g, b, a] = this.clearColor;
    gl.clearColor(r, g, b, a);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }

  drawQuadBuffer(buffer: QuadBuffer) {
    this.program.use();
    this.setUniforms();
    buffer.draw(this.program);
  }

  drawIdBuffer(buffer: QuadBuffer){
    this.program.use()
    this.setUniforms()
    buffer.drawQuadId(this.program)
  }

  finish() { }

  private setUniforms() {
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture.texture);
    this.program.setUniform('uView', this.camera.view());
    this.program.setUniform('uProjection', this.projection);
    this.program.setUniform('uModel', this.model);
    this.program.setUniform('uTextureSize', [this.texture.width, this.texture.height]);
    this.program.setUniform('uTexture', [0]);
  }
}
