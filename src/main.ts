import vertexSrc from '../glsl/vertex.glsl'
import fragmentSrc from '../glsl/fragment.glsl'
import { mat3, vec3, vec4 } from 'gl-matrix'
import { ShaderProgram } from './shader-program'
import { Texture } from './texture'
import { QuadBuffer } from './quad-buffer'
import { Framebuffer } from './framebuffer'
import { Camera } from './camera'
import { QuadList, CubeBuffer, decode } from './cube-buffer'
import { Tileset } from './tileset'
import { Renderer } from './renderer'
import { Editor } from './editor'

async function main(editorAttached: Boolean){
  const canvas = document.createElement('canvas')
  document.body.append(canvas);
  const gl = canvas.getContext("webgl")
  const renderer = new Renderer(gl)
  
  const texture = await Texture.load(gl, 'assets/terrain_atlas.png')
  const framebuffer = new Framebuffer(gl, 512, 512)
  const quadIdProgram = new ShaderProgram(gl, vertexSrc, fragmentSrc, ['QUADID']);
  const program = new ShaderProgram(gl, vertexSrc, fragmentSrc);
  const quads = new QuadBuffer(gl,1024)
  const camera = new Camera({
    position: [0,1,3],
    viewDir: [0,0,-1]
  })
  
  const pixels = new Uint8Array(512*512*4)
  
  const tileset = new Tileset(texture, 32, 32)
  const cubes = new CubeBuffer(tileset, quads)
  const editor: Editor = editorAttached ? new Editor(canvas, cubes, pixels, camera, tileset) : null
  
  const draw = time => {
    quads.update()

    renderer.camera = camera
    renderer.texture = texture

    renderer.program = quadIdProgram
    renderer.clearColor = vec4.fromValues(0,0,0,0)
    renderer.start(framebuffer)
    renderer.drawIdBuffer(quads)
    renderer.finish()

    renderer.program = program
    renderer.clearColor = vec4.fromValues(0.3,0.3,1.0,1.0)
    renderer.start()
    renderer.drawQuadBuffer(quads)
    renderer.finish()

    framebuffer.readPixels(pixels)

    editor?.update(time)

    const err = gl.getError()
    if(err !== gl.NO_ERROR){
      throw new Error('GL Error: ' + err)
    }
    requestAnimationFrame(draw)
  }

  requestAnimationFrame(draw)
}

addEventListener('DOMContentLoaded', () => {
  const editorAttached = window.parent !== window
  main(editorAttached).catch(x => console.error(x))
})