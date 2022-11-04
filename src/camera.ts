// adapted from Eric Arnebäck under MIT license
// See: https://github.com/Erkaman/gl-movable-camera

import { mat4, quat, vec2, vec3 } from "gl-matrix"
import { Direction } from "./quad-buffer"

function rotateVectorAboutAxis(v, axis, angle) {
    const sinHalfAngle = Math.sin(angle / 2.0)
    const cosHalfAngle = Math.cos(angle / 2.0)

    const rX = axis[0] * sinHalfAngle
    const rY = axis[1] * sinHalfAngle
    const rZ = axis[2] * sinHalfAngle
    const rW = cosHalfAngle

    const q = quat.fromValues(rX, rY, rZ, rW)

    // find the conjugate of q.
    const q_conj = quat.create()
    quat.copy(q_conj, q)
    quat.conjugate(q_conj, q_conj)

    const p = quat.fromValues(v[0], v[1], v[2], 0)

    const result = quat.create()

    /*
     Compute the product (q * p * q_conj)
     For more details, please see page 75 in "Real-time rendering - Third edition"
     */
    quat.multiply(result, q, p)
    quat.multiply(result, result, q_conj)

    return vec3.fromValues(result[0], result[1], result[2])
}

interface CameraOptions {
    position?: vec3,
    viewDir?: vec3
}

export class Camera {

    position: vec3
    viewDir: vec3
    up: vec3
    right: vec3
    turningVelocity: number
    velocity: number
    private mat = mat4.create()

    constructor(opts?: CameraOptions){
        opts = opts || {}

        this.position = opts.position || vec3.fromValues(0,0,0);
        this.viewDir = opts.viewDir || vec3.fromValues(-1,0,0);

        // up vector
        this.up = vec3.fromValues(0,1,0);

        // right vector.
        this.right = vec3.create();
        vec3.cross(this.right, this.up, this.viewDir);
        vec3.normalize(this.right, this.right);

        this.turningVelocity = 0.02;
        this.velocity = 0.5;
    }

    turn(head: number, pitch: number, speed: number){
         // rotate about up vector.
         this.viewDir = rotateVectorAboutAxis( this.viewDir,  this.up, head * speed)

         // rotate about right vector.
         this.viewDir = rotateVectorAboutAxis( this.viewDir, this.right , pitch * speed)

         // update right vector.
         vec3.cross(this.right, this.up, this.viewDir );
         vec3.normalize(this.right, this.right);
    }

    walk(walkForward: boolean, speed: number){
        const walkDir = vec3.create();
        vec3.copy(walkDir, this.viewDir);

        let walkAmount = speed;
        if(!walkForward) {
            walkAmount *= -1; // walk backwards instead.
        }

        vec3.scale(walkDir, walkDir, walkAmount);

        vec3.add(this.position, this.position, walkDir);
    }

    stride(strideRight: boolean, speed: number){
        const strideDir = vec3.create();
        vec3.copy(strideDir, this.right);

        let strideAmount = speed;
        if(!strideRight) {
            strideAmount *= -1; // walk right instead.
        }

        vec3.scale(strideDir, strideDir, strideAmount);

        vec3.add(this.position, this.position, strideDir);
    }

    fly(flyUp: boolean, speed: number){
        const flyDir = vec3.create();
        vec3.copy(flyDir, this.up);

        let flyAmount = speed;
        if(!flyUp) {
            flyAmount *= -1; // fly down instead.
        }

        vec3.scale(flyDir, flyDir, flyAmount);
        vec3.add(this.position, this.position, flyDir);
    }

    view() {
        const out = this.mat
        mat4.identity(out)

        const cameraTarget = vec3.create();
        vec3.add(cameraTarget, this.position, this.viewDir );

        mat4.lookAt(out, this.position, cameraTarget, this.up )

        return out;
    }

    control(dt: number, directions: [boolean,boolean,boolean,boolean,boolean,boolean], mouse: vec2, mousePrev: vec2){
        dt = (dt/1000) * 10

        if(!vec2.equals(mouse,mousePrev)) {
            this.turn( -(mouse[0] - mousePrev[0]), (mouse[1] - mousePrev[1]), this.turningVelocity*dt );
        }
    
        const v = dt*this.velocity

        if(directions[Direction.Front]) {
            this.walk(true,v);
        } else if(directions[Direction.Back]) {
            this.walk(false,v);
        }
    
        if(directions[Direction.Left]) {
            this.stride(true,v);
        } else if(directions[Direction.Right]) {
            this.stride(false,v);
        }

        if(directions[Direction.Top]) {
            this.fly(true,v);
        } else if(directions[Direction.Bottom]) {
            this.fly(false,v);
        }
    }
}