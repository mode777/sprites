import { vec2, vec3, vec4 } from 'gl-matrix'
import { gl } from './main'
import { ShaderProgram } from './shader-program'

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
  colorsBuffer: WebGLBuffer
  colors: Uint8Array
  indexBuffer: WebGLBuffer
  quadIdBuffer: WebGLBuffer

  constructor(private gl: WebGLRenderingContext, public readonly capacity: number) {
    this.positionsBuffer = gl.createBuffer()
    this.uvsBuffer = gl.createBuffer() 
    this.colorsBuffer = gl.createBuffer()

    this.positions = new Float32Array(capacity * 3 * 4)
    this.uvs = new Uint16Array(capacity * 2 * 4)
    this.colors = new Uint8Array(capacity * 4 * 4)

    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionsBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, this.positions.buffer.byteLength, gl.STREAM_DRAW)
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.uvsBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, this.uvs.buffer.byteLength, gl.STREAM_DRAW)
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.colorsBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, this.colors.buffer.byteLength, gl.STREAM_DRAW)
    
    this.createIndices()
    this.createQuadIds()
  }

  private createQuadIds(){
    const data = new Uint32Array(this.capacity * 4)
    const start = 0xFFFFFFFF
    for (let i = 0; i < this.capacity; i++) {
      // 0xAABBGGRR
      const val = 0xFF000000 + i
      data.fill(val,i*4,i*4+4)
    }
    this.quadIdBuffer = this.gl.createBuffer()
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.quadIdBuffer)
    this.gl.bufferData(this.gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
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

    gl.bindBuffer(gl.ARRAY_BUFFER, this.colorsBuffer)
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.colors)
  }

  enableAttribute(buffer: WebGLBuffer, attribute: number, components: number, type: number, normalized: boolean){
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.vertexAttribPointer(attribute, components, type, normalized, 0, 0)
    gl.enableVertexAttribArray(attribute)
  }

  draw(program: ShaderProgram) {
    const aPos = <number>program.attributes['aPos'].location
    const aUv = <number>program.attributes['aUv'].location
    const aColor = <number>program.attributes['aColor'].location
    
    this.enableAttribute(this.positionsBuffer, aPos, 3, gl.FLOAT, false)
    this.enableAttribute(this.uvsBuffer, aUv, 2, gl.UNSIGNED_SHORT, false)
    this.enableAttribute(this.colorsBuffer, aColor, 4, gl.UNSIGNED_BYTE, true)

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer)
    gl.drawElements(gl.TRIANGLES, this.capacity * 6, gl.UNSIGNED_SHORT, 0)
  }

  drawQuadId(program: ShaderProgram) {
    const aPos = <number>program.attributes['aPos'].location
    const aColor = <number>program.attributes['aColor'].location
    
    this.enableAttribute(this.positionsBuffer, aPos, 3, gl.FLOAT, false)
    this.enableAttribute(this.quadIdBuffer, aColor, 4, gl.UNSIGNED_BYTE, true)

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
    
    let a: vec3, b: vec3, c: vec3, d: vec3, color: vec4

    const high: vec4 = [255,255,255,255]
    const med1: vec4 = [192,192,192,255]
    const med2: vec4 = [160,160,160,255]
    const low: vec4 = [128,128,128,255]
    
    switch (dir) {
      case Direction.Front:
        a = [ox-o,oy-o,oz]
        b = [ox-o,oy+o,oz]
        c = [ox+o,oy+o,oz]
        d = [ox+o,oy-o,oz]
        color = med1
        break
      case Direction.Back:
        a = [ox+o,oy-o,oz]
        b = [ox+o,oy+o,oz]
        c = [ox-o,oy+o,oz]
        d = [ox-o,oy-o,oz]
        color = med1
        break
      case Direction.Left:
        a = [ox,oy-o,oz-o]
        b = [ox,oy+o,oz-o]
        c = [ox,oy+o,oz+o]
        d = [ox,oy-o,oz+o]
        color = med2
        break
      case Direction.Right:
        a = [ox,oy-o,oz+o]
        b = [ox,oy+o,oz+o]
        c = [ox,oy+o,oz-o]
        d = [ox,oy-o,oz-o]
        color = med2
        break
      case Direction.Top:
        a = [ox+o,oy,oz+o]
        b = [ox-o,oy,oz+o]
        c = [ox-o,oy,oz-o]
        d = [ox+o,oy,oz-o]
        color = high
        break
      case Direction.Bottom:
        a = [ox+o,oy,oz+o]
        b = [ox+o,oy,oz-o]
        c = [ox-o,oy,oz-o]
        d = [ox-o,oy,oz+o]
        color = low
        break
      default:
        throw new Error('Invalid direction')
    }

    this.writeVertex(i, a, [x, y+h], color)
    this.writeVertex(i+1, b, [x, y], color)
    this.writeVertex(i+2, c, [x+w, y], color)
    this.writeVertex(i+3, d, [x+w, y+h], color)
  }

  writeVertex(i: number, pos: vec3, uv: vec2, color: vec4) {
    this.positions.set(pos, i * 3)
    this.uvs.set(uv, i * 2)
    this.colors.set(color, i*4)
  }

  setColor(i: number, color: vec4){
    const offset = i*16
    this.colors.set(color, offset)
    this.colors.set(color, offset+4)
    this.colors.set(color, offset+8)
    this.colors.set(color, offset+12)
  }
  getColor(i: number): vec4{
    const offset = i*16
    return <vec4><unknown>this.colors.subarray(offset,offset+4)
  }
}
