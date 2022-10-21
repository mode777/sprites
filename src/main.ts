import vertexSrc from '../glsl/vertex.glsl'
import fragmentSrc from '../glsl/fragment.glsl'
import { mat4, vec4 } from 'gl-matrix'
import { ShaderProgram } from './shader-program'
import { Texture } from './texture'
import { Direction, QuadBuffer } from './quad-buffer'

class Framebuffer {
  private framebuffer: WebGLFramebuffer
  private texture: Texture
  private depthBuffer: WebGLRenderbuffer

  constructor(private gl: WebGLRenderingContext, private width, private height){
    // Create and bind the framebuffer
    this.framebuffer = gl.createFramebuffer()
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer)
    this.texture = Texture.create(gl, width, height)
    
    // attach the texture as the first color attachment
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0)

    // create a depth renderbuffer
    this.depthBuffer = gl.createRenderbuffer()
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthBuffer)
 
    // make a depth buffer and the same size as the targetTexture
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height)
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.depthBuffer)
    if(gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error('Invalid framebuffer configuration')

    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  }

  bind(){
    const gl = this.gl
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer)
    gl.viewport(0,0,this.texture.width, this.texture.height)
  }

  unbind(){
    const gl = this.gl
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.viewport(0,0,gl.canvas.width, gl.canvas.height)
  }
}


const canvas = document.createElement('canvas')
canvas.width = 640
canvas.height = 480
document.body.append(canvas);
export const gl = canvas.getContext("webgl")

let proj: mat4 
let view = mat4.lookAt(mat4.create(), [0,1,1], [0,0,0], [0,1,0])
let model = mat4.identity(mat4.create())
let texture: Texture
mat4.rotateY(model, model, 3.8)
const program = new ShaderProgram(gl, vertexSrc, fragmentSrc, ['QUADID']);

function resize(){
  const w = document.body.clientWidth
  const h = document.body.clientHeight
  canvas.width = w
  canvas.height = h
  gl.viewport(0,0,canvas.width,canvas.height)
  proj = mat4.perspective(mat4.create(), Math.PI/2, canvas.width/canvas.height, 0.1, 100)
}

function setUniforms(){
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, texture.texture)
  program.setUniform('uView', ...view)
  program.setUniform('uProjection', ...proj)
  mat4.rotateY(model, model, 0.01)
  program.setUniform('uModel', ...model)
  program.setUniform('uTextureSize', texture.width, texture.height)
  program.setUniform('uTexture', 0)
}

async function main(){
  resize()
  texture = await Texture.load(gl, 'assets/terrain_atlas.png')
  //const program = new ShaderProgram(gl, vertexSrc, fragmentSrc);

  const quads = new QuadBuffer(gl,6)
  const o = 0.5
  const rect: vec4 = [128,384,32,32]
  quads.set(0, Direction.Front, rect, [0,0,o])
  quads.set(1, Direction.Back, rect, [0,0,-o])
  quads.set(2, Direction.Left, rect, [-o,0,0])
  quads.set(3, Direction.Right, rect, [o,0,0])
  quads.set(4, Direction.Top, rect, [0,o,0])
  quads.set(5, Direction.Bottom, rect, [0,-o,0])

  const draw = time => {
    quads.update()


    gl.enable(gl.CULL_FACE)
    gl.enable(gl.DEPTH_TEST)

    gl.clearColor(1,0,0,0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    program.use()
    setUniforms()
    quads.drawQuadId(program)

    const err = gl.getError()
    if(err !== gl.NO_ERROR){
      throw new Error('GL Error: ' + err)
    }

    requestAnimationFrame(draw)
  }

  requestAnimationFrame(draw)
}



addEventListener('DOMContentLoaded', () => {
  if(window.parent !== window){
    console.log('Running as IFrame')
  } else {
    console.log('Running Standalone')
  }
  main().catch(x => console.error(x))
})
addEventListener('resize', () => {
  resize()
})

//console.log(gl.getParameter(gl.MAX_TEXTURE_SIZE));