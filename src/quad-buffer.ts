import { vec2, vec3, vec4 } from 'gl-matrix'
import { gl } from './main'

export enum Direction {
  Front,
  Back,
  Left,
  Right,
  Top,
  Bottom
}

export class QuadBuffer {

  positionsBuffer: WebGLBuffer
  positions: Float32Array
  uvsBuffer: WebGLBuffer
  uvs: Uint16Array
  indexBuffer: WebGLBuffer

  constructor(private gl: WebGLRenderingContext, public readonly capacity: number) {
    this.positionsBuffer = gl.createBuffer()
    this.uvsBuffer = gl.createBuffer() 
    this.positions = new Float32Array(capacity * 3 * 4)
    this.uvs = new Uint16Array(capacity * 2 * 4)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionsBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, this.positions.buffer.byteLength, gl.STREAM_DRAW)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.uvsBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, this.uvs.buffer.byteLength, gl.STREAM_DRAW)
    this.createIndices()
  }

  private createIndices(){
    const data = new Uint16Array(this.capacity * 6)
    let v = 0
    for (let i = 0; i < this.capacity; i++) {
      data.set([v,v+2,v+1,v,v+3,v+2], i*6)
      v+=4
    }
    this.indexBuffer = this.gl.createBuffer()
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer)
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW)
  }

  update() {
    const gl = this.gl
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionsBuffer)
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.positions)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.uvsBuffer)
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.uvs)
  }

  draw(attrPos, attrUv) {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionsBuffer)
    gl.vertexAttribPointer(attrPos, 3, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(attrPos)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.uvsBuffer)
    gl.vertexAttribPointer(attrUv, 2, gl.UNSIGNED_SHORT, false, 0, 0)
    gl.enableVertexAttribArray(attrUv)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer)
    gl.drawElements(gl.TRIANGLES, this.capacity * 6, gl.UNSIGNED_SHORT, 0)
  }

  set(index: number, dir: Direction, sprite: vec4, offset: vec3 = [0,0,0]) {
    const i = index*4
    const uvs = this.uvs
    const pos = this.positions
    const [ox,oy,oz] = offset
    const [x,y,w,h] = sprite
    const o = 0.5 
    
    let a: vec3, b: vec3, c: vec3, d: vec3
    switch (dir) {
      case Direction.Front:
        a = [ox-o,oy-o,oz]
        b = [ox-o,oy+o,oz]
        c = [ox+o,oy+o,oz]
        d = [ox+o,oy-o,oz]
        break
      case Direction.Back:
        a = [ox+o,oy-o,oz]
        b = [ox+o,oy+o,oz]
        c = [ox-o,oy+o,oz]
        d = [ox-o,oy-o,oz]
        break
      case Direction.Left:
        a = [ox,oy-o,oz-o]
        b = [ox,oy+o,oz-o]
        c = [ox,oy+o,oz+o]
        d = [ox,oy-o,oz+o]
        break
      case Direction.Right:
        a = [ox,oy-o,oz+o]
        b = [ox,oy+o,oz+o]
        c = [ox,oy+o,oz-o]
        d = [ox,oy-o,oz-o]
        break
      case Direction.Top:
        a = [ox+o,oy,oz+o]
        b = [ox-o,oy,oz+o]
        c = [ox-o,oy,oz-o]
        d = [ox+o,oy,oz-o]
        break
      case Direction.Bottom:
        a = [ox+o,oy,oz+o]
        b = [ox+o,oy,oz-o]
        c = [ox-o,oy,oz-o]
        d = [ox-o,oy,oz+o]
        break
      default:
        throw new Error('Invalid direction')
    }

    this.writeVertex(i, a, [x, y+h])
    this.writeVertex(i+1, b, [x, y])
    this.writeVertex(i+2, c, [x+w, y])
    this.writeVertex(i+3, d, [x+w, y+h])
  }

  writeVertex(i: number, pos: vec3, uv: vec2) {
    this.positions.set(pos, i * 3)
    this.uvs.set(uv, i * 2)
  }
}
