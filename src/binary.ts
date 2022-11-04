import { CubeBuffer, QuadList } from "./cube-buffer"
import { Direction, QuadBuffer } from "./quad-buffer"
import { Tileset } from "./tileset"

export function encodeCubeBuffer(cubeBuffer: CubeBuffer){
    const buffer = new DynamicBuffer()
    encodeInfo(buffer, cubeBuffer.tileset)
    encodeCubes(buffer, cubeBuffer.cubes)
    return buffer.toArray()
}

function encodeInfo(buffer: DynamicBuffer, tileset: Tileset) {
    const json = {
        version: '1.0',
        tileset: {
            path: tileset.filename,
            tileWidth: tileset.tileWidth,
            tileHeight: tileset.tileHeight
        }
    }
    const encoded = JSON.stringify(json) 
    encodeTextChunk(buffer, 'INFO', encoded)
}

function encodeCubes(buffer: DynamicBuffer, cubes: Map<number,QuadList>) {
    const innerBuffer = new DynamicBuffer()
    for (const cube of cubes) {
        const [coord,data] = cube

        innerBuffer.writeUint32(coord)
        
        let mask = 0
        const offset = innerBuffer.offset
        innerBuffer.writeUint8(mask)
        
        for (let i = 0; i <= Direction.Bottom; i++) {
            const element = data[i]
            if(element){
                innerBuffer.writeUint32(element.tileId)
                mask |= (1 << i) 
            }
        }

        innerBuffer.writeUint8(mask, offset)
    }
    encodeBinaryChunk(buffer, 'CUBE', innerBuffer)
}

function encodeTextChunk(buffer: DynamicBuffer, chunkId: string, text: string) {
    const chunkIdEncoded = toAscii(chunkId)
    buffer.writeBuffer(chunkIdEncoded)
    const textEncoded = toUtf8(text)
    buffer.writeUint32(textEncoded.byteLength)
    buffer.writeBuffer(textEncoded)
}

function encodeBinaryChunk(buffer: DynamicBuffer, chunkId: string, binaryData: DynamicBuffer) {
    const chunkIdEncoded = toAscii(chunkId)
    buffer.writeBuffer(chunkIdEncoded)
    const length = binaryData.size
    buffer.writeUint32(length)
    buffer.writeBuffer(binaryData.buffer, length)
}

function toUtf8(str: string): ArrayBuffer{
    return new TextEncoder().encode(str)
}

function toAscii(str: string): ArrayBuffer {
    const buffer = new Uint8Array(str.length)
    for (let i = 0; i < str.length; i++) {
        buffer[i] = str.charCodeAt(i)
    }
    return buffer.buffer
}

class DynamicBuffer {

    buffer: ArrayBuffer
    view: DataView
    bytes: Uint8Array
    offset = 0
    capacity = 0
    size = 0

    constructor(){
        this.capacity = 1024
        this.buffer = new ArrayBuffer(this.capacity)
        this.view = new DataView(this.buffer)
        this.bytes = new Uint8Array(this.buffer)
    }

    writeBuffer(buffer: ArrayBuffer, size = -1) {
        size = size === -1 ? buffer.byteLength : size
        this.ensureSize(this.offset+size)
        this.bytes.set(new Uint8Array(buffer, 0, size), this.offset)
        this.offset += size
        this.size = Math.max(this.offset, this.size)
    }

    writeUint32(v: number, offset = -1) {
        offset = offset === -1 ? this.offset : offset
        this.ensureSize(offset+4)
        this.view.setUint32(offset,v)
        if(offset !== -1){
            this.offset += 4
            this.size = Math.max(this.size, this.offset)
        }
    }
    writeUint8(v: number, offset = -1) {
        offset = offset === -1 ? this.offset : offset
        this.ensureSize(offset+1)
        this.view.setUint8(offset,v)
        if(offset !== -1){
            this.offset += 1
            this.size = Math.max(this.size, this.offset)
        }
    }

    private ensureSize(size: number){
        while(size > this.capacity){
            this.grow()
        }
    }

    private grow(){
        const newCapa = this.capacity*2
        const newBuffer = new ArrayBuffer(newCapa)
        
        const oldArr = new Uint8Array(this.buffer)
        const newArr = new Uint8Array(newBuffer)
        newArr.set(oldArr,0)

        this.capacity = newCapa
        this.buffer = newBuffer
        this.view = new DataView(this.buffer)
        this.bytes = new Uint8Array(this.buffer)
    }

    toArray() {
        return new Uint8Array(this.buffer, 0, this.size)
    }
}