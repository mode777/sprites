import { vec3, vec4 } from 'gl-matrix';
import { neighbour, Direction, oppositeDirection, QuadBuffer } from './quad-buffer';
import { Tileset } from './tileset';
interface QuadSpec {
  quadId: number,
  tileId: number
}
export type QuadList = [QuadSpec,QuadSpec,QuadSpec,QuadSpec,QuadSpec,QuadSpec]

// MASK:      0bxxxxxxxxxxxxyyyyyyyyyyyyzzzzzzzz
const MASK_X =0b11111111111100000000000000000000 
const MASK_Y =0b00000000000011111111111100000000 
const MASK_Z =0b00000000000000000000000011111111 

export function encode(x: number, y: number, z: number){
  x += 2048
  y += 2048
  z += 128
  return (x << 20) | (y << 8 ) | z
}

export function decode(encoded: number){
  const x = ((encoded & MASK_X) >>> 20)-2048 
  const y = ((encoded & MASK_Y) >>> 8)-2048
  const z = ((encoded & MASK_Z))-128
  return [x,y,z]
}

export class CubeBuffer {

  cubes = new Map<number, QuadList>();
  neighbours: number[] = [];

  constructor(public readonly tileset: Tileset, public quads: QuadBuffer) {
  }

  exists(x: number, y: number, z: number) {
    return !!this.cubes.has(encode(x, y, z));
  }

  get(x: number, y: number, z: number) {
    const encoded = encode(x, y, z);
    const found = this.cubes.get(encoded);
    return found;
  }

  add(x: number, y: number, z: number, tids: number[]) {
    if (this.exists(x, y, z))
      throw new Error('Cube already exists');
    const quads: QuadList = <QuadList>new Array<QuadSpec>(6);
    const o = 0.5;

    if(tids[0]) this.addPlane(x, y, z, Direction.Front, tids[0], [x, y, z + o], quads);
    if(tids[1]) this.addPlane(x, y, z, Direction.Back, tids[1], [x, y, z - o], quads);
    if(tids[2]) this.addPlane(x, y, z, Direction.Left, tids[2], [x - o, y, z], quads);
    if(tids[3]) this.addPlane(x, y, z, Direction.Right, tids[3], [x + o, y, z], quads);
    if(tids[4]) this.addPlane(x, y, z, Direction.Top, tids[4], [x, y + o, z], quads);
    if(tids[5]) this.addPlane(x, y, z, Direction.Bottom, tids[5], [x, y - o, z], quads);

    const encoded = encode(x, y, z);
    this.cubes.set(encoded, quads)
    //console.log(this.cubes)
  }

  addToQuad(quadId: number, tileIds: number[]) {
    const encoded = this.neighbours[quadId];
    if (encoded === undefined)
      throw new Error('Unknown quadid');
    const [x, y, z] = decode(encoded);
    this.add(x, y, z, tileIds);
  }  

  private addPlane(x: number, y: number, z: number, dir: Direction, tileId: number, coords: vec3, quadList: QuadList) {
    [x, y, z] = neighbour(x, y, z, dir);
    const n = this.get(x, y, z);
    const op = n ? n[oppositeDirection(dir)] : undefined;
    if (op !== undefined) {
      this.quads.remove(op.quadId);
      delete this.neighbours[op.quadId];
    } else {
      const sprite = <vec4>this.tileset.coordinates(tileId)
      const quadId = this.quads.add(dir, sprite, coords);
      quadList[dir] = { quadId, tileId }
      this.neighbours[quadId] = encode(x, y, z);
    }
  }

  serialize(){
    return JSON.stringify({
      cubes: this.cubes,
      neighbours: this.neighbours
    })
  }
}
