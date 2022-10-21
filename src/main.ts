import vertexSrc from '../glsl/vertex.glsl'
import fragmentSrc from '../glsl/fragment.glsl'
import { mat4, vec4 } from 'gl-matrix'
import { ShaderProgram } from './shader-program'
import { Texture } from './texture'
import { Direction, QuadBuffer } from './quad-buffer'

const canvas = document.createElement('canvas')
canvas.width = 640
canvas.height = 480
document.body.append(canvas);
export const gl = canvas.getContext("webgl")

let proj: mat4 
let view = mat4.lookAt(mat4.create(), [0,1,1], [0,0,0], [0,1,0])
let model = mat4.identity(mat4.create())
mat4.rotateY(model, model, 3.8)

function resize(){
  const w = document.body.clientWidth
  const h = document.body.clientHeight
  canvas.width = w
  canvas.height = h
  gl.viewport(0,0,canvas.width,canvas.height)
  proj = mat4.perspective(mat4.create(), Math.PI/2, canvas.width/canvas.height, 0.1, 100)
}

async function main(){
  resize()
  const program = new ShaderProgram(gl, vertexSrc, fragmentSrc);

  const texture = await Texture.load(gl, 'assets/terrain_atlas.png')

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

    gl.clearColor(1,0,0,1)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    program.use()
    
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, texture.texture)
    program.setUniform('uView', ...view)
    program.setUniform('uProjection', ...proj)
    mat4.rotateY(model, model, 0.01)
    program.setUniform('uModel', ...model)
    program.setUniform('uTextureSize', texture.width, texture.height)
    program.setUniform('uTexture', 0)
    
    const aPos = <number>program.attributes['aPos'].location
    const aUv = <number>program.attributes['aUv'].location
    quads.draw(aPos,aUv)
    // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, testbuf_el)
    // gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0)

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