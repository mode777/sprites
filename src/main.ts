import vertexSrc from '../glsl/vertex.glsl'
import fragmentSrc from '../glsl/fragment.glsl'
import { mat4, vec4 } from 'gl-matrix'
import { ShaderProgram } from './shader-program'
import { Texture } from './texture'
import { Direction, QuadBuffer } from './quad-buffer'
import { Framebuffer } from './framebuffer'

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
const quadIdProgram = new ShaderProgram(gl, vertexSrc, fragmentSrc, ['QUADID']);
const program = new ShaderProgram(gl, vertexSrc, fragmentSrc);
let framebuffer = new Framebuffer(gl, 512, 512)
const pixels = new Uint8Array(512*512*4)
const quads = new QuadBuffer(gl,6)
const o = 0.5
const rect: vec4 = [128-32,384-64,32,32]
quads.set(0, Direction.Front, rect, [0,0,o])
quads.set(1, Direction.Back, rect, [0,0,-o])
quads.set(2, Direction.Left, rect, [-o,0,0])
quads.set(3, Direction.Right, rect, [o,0,0])
quads.set(4, Direction.Top, rect, [0,o,0])
quads.set(5, Direction.Bottom, rect, [0,-o,0])

function resize(){
  const w = document.body.clientWidth
  const h = document.body.clientHeight
  canvas.width = w
  canvas.height = h
  gl.viewport(0,0,canvas.width,canvas.height)
  proj = mat4.perspective(mat4.create(), Math.PI/2, canvas.width/canvas.height, 0.1, 100)
}

function setUniforms(program: ShaderProgram){
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, texture.texture)
  program.setUniform('uView', ...view)
  program.setUniform('uProjection', ...proj)
  mat4.rotateY(model, model, 0.01)
  program.setUniform('uModel', ...model)
  program.setUniform('uTextureSize', texture.width, texture.height)
  program.setUniform('uTexture', 0)
}

let currentQuad: number = -1
let oldColor: number[]
let mouseColor: ArrayLike<number> = [0,0,0,0]

canvas.addEventListener('mousemove', (ev) => {
  const x = Math.floor((ev.clientX/canvas.width)*512)
  const y = Math.floor((1-(ev.clientY/canvas.height))*512)
  const offset = (y*512+x)*4
  mouseColor = pixels.subarray(offset, offset+4)
})

async function main(){
  resize()
  texture = await Texture.load(gl, 'assets/terrain_atlas.png')
  //const program = new ShaderProgram(gl, vertexSrc, fragmentSrc);

  const draw = time => {
    quads.update()

    gl.enable(gl.CULL_FACE)
    gl.enable(gl.DEPTH_TEST)

    framebuffer.bind()
    gl.clearColor(0,0,0,0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    quadIdProgram.use()
    setUniforms(quadIdProgram)
    quads.drawQuadId(program)
    framebuffer.unbind()

    gl.clearColor(0.3,0.3,0.3,1)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    program.use()
    setUniforms(program)
    quads.draw(program)

    framebuffer.readPixels(pixels)

    const quad = mouseColor[3] === 0 ? -1 : ((mouseColor[2] << 16) | (mouseColor[1] << 8) | mouseColor[0])
  
    if(currentQuad !== quad){
      if(currentQuad !== -1) {
        quads.setColor(currentQuad, <vec4>oldColor)
      }
      currentQuad = quad
      if(currentQuad !== -1){
        oldColor = [...quads.getColor(currentQuad)]
        quads.setColor(currentQuad, [255,0,0,255])
      }
    }

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