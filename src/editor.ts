import { vec2, vec4 } from 'gl-matrix';
import { Direction } from './quad-buffer';
import { Camera } from './camera';
import { CubeBuffer } from './cube-buffer';
import { Tileset } from './tileset';
import { encodeCubeBuffer } from './binary';

export class Editor {
  private mouselook = false;
  private editMode = 'build';
  private currentQuad: number = -1;
  private oldColor: number[];
  private mouseColor: ArrayLike<number> = [0, 0, 0, 0];
  private directions: [boolean, boolean, boolean, boolean, boolean, boolean] = [
    false,
    false,
    false,
    false,
    false,
    false
  ];
  private mapping = {
    ' ': Direction.Top,
    'w': Direction.Front,
    's': Direction.Back,
    'a': Direction.Left,
    'd': Direction.Right,
  };
  private prevMouse: vec2 = [0, 0];
  private mouse: vec2 = [0, 0];
  private prevtime = 0;
  private tileIds: [number,number,number,number,number,number] = [0,0,0,0,0,0]

  constructor(private canvas: HTMLCanvasElement, private cubes: CubeBuffer, private pixels: Uint8Array, private camera: Camera, private tileset: Tileset) {
    canvas.addEventListener('click', (e) => this.onClick(e));
    canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
    canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
    canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
    canvas.addEventListener('mouseleave', (e) => this.onMouseLeave(e));
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    addEventListener('keydown', (e) => this.onKeyDown(e));
    addEventListener('keyup', (e) => this.onKeyUp(e));
    addEventListener('message', (e) => this.onMessage(e));

    this.buildPlane(16, 16);
  }

  buildPlane(w: number, h: number) {
    let rect: vec4 = [21 * 32, 22 * 32, 32, 32];
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const grasses = [
          [704, 288, 32, 32]
        ];
        const r = Math.floor(Math.random() * grasses.length);
        this.cubes.add(x, 0, y, [0, 0, 0, 0, 183, 0]);
      }
    }
  }

  update(time: number) {
    this.camera.control(time - this.prevtime, this.directions, this.mouse, this.prevMouse);
    this.prevMouse = <vec2>[...this.mouse];
    const quad = this.mouseColor[3] === 0 ? -1 : ((this.mouseColor[2] << 16) | (this.mouseColor[1] << 8) | this.mouseColor[0]);

    if (this.currentQuad !== quad) {
      if (this.currentQuad !== -1) {
        this.cubes.quads.setColor(this.currentQuad, <vec4>this.oldColor);
      }
      this.currentQuad = quad;
      if (this.currentQuad !== -1) {
        this.oldColor = [...this.cubes.quads.getColor(this.currentQuad)];
        this.cubes.quads.setColor(this.currentQuad, [255, 0, 0, 255]);
      }
    }
    this.prevtime = time;
  }

  onClick(ev: MouseEvent) {
    if (this.currentQuad !== -1 && ev.button === 0) {
      //console.log(currentQuad)
      if (this.editMode === 'build') {
        this.cubes.addToQuad(this.currentQuad, this.tileIds)
      } else if (this.editMode === 'paint') {
        this.cubes.quads.setSprite(this.currentQuad, <vec4>this.tileset.coordinates(this.tileIds[0]))
      }
    }
  }

  onMouseMove(ev: MouseEvent) {
    if (this.mouselook) {
      this.mouse = [ev.clientX, ev.clientY];
    }
    const x = Math.floor((ev.clientX / this.canvas.width) * 512);
    const y = Math.floor((1 - (ev.clientY / this.canvas.height)) * 512);
    const offset = (y * 512 + x) * 4;
    this.mouseColor = this.pixels.subarray(offset, offset + 4)
  }

  onMouseDown(ev: MouseEvent) {
    if (ev.button == 2) {
      this.mouselook = true;
      this.mouse = [ev.clientX, ev.clientY];
      this.prevMouse = [ev.clientX, ev.clientY];
    }
  }

  onMouseUp(ev: MouseEvent) {
    if (ev.button == 2) {
      this.mouselook = false;
    }
  }

  onMouseLeave(ev: MouseEvent) {
    this.mouselook = false;
  }

  onKeyDown(e: KeyboardEvent): any {
    const idx = this.mapping[e.key];
    if (idx !== undefined) {
      this.directions[idx] = true;
    }
  }
  onKeyUp(e: KeyboardEvent): any {
    const idx = this.mapping[e.key];
    if (idx !== undefined) {
      this.directions[idx] = false;
    }
  }

  onMessage(e: MessageEvent): any {
    switch (e.data.data.command) {
      case 'pick-tile':
        //this.rect = e.data.data.sprite;
        const t = e.data.data.tileId
        this.tileIds = [t,t,t,t,t,t]
        break;
      case 'set-tool':
        this.editMode = e.data.data.name;
        break;
      case 'save':
        const arr = encodeCubeBuffer(this.cubes)
        const b64 = btoa([].reduce.call(arr,function(p,c){return p+String.fromCharCode(c)},''))
        window.top.postMessage({ command: 'store', data: b64 }, '*')
        break;
    }
  }
}
