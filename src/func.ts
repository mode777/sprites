
// type UniformValue = vec2 | vec3 | vec4 | mat3 | mat4
// interface TextureSpec {
//   uniform: string,
//   texture: WebGLTexture
// }

// interface DrawPass {
//   viewport: [number,number,number,number]
//   clearColor: [number,number,number,number],
//   framebuffer?: WebGLFramebuffer,
//   clearFlags?: number
//   drawables: Drawable[]
// }

// interface AttributeSpec {
//   buffer: WebGLBuffer,
//   type: number,
//   offset?: number,
//   components: number,
//   stride?: number,
//   normalized?: boolean 
// }

// interface IndexSpec {
//   buffer: WebGLBuffer,
//   elements: number,
//   type?: number,
//   primitiveType?: number
// }

// interface Drawable {
//   program: WebGLProgram
//   uniforms: {[key: number]: UniformValue },
//   textures: TextureSpec[],
//   attributes: {[key: number]: AttributeSpec }
// }

// function drawPass(gl: WebGLRenderingContext, pass: DrawPass){
//   gl.bindFramebuffer(gl.FRAMEBUFFER, pass.framebuffer ?? null)
//   gl.viewport(...pass.viewport)
//   gl.clearColor(...pass.clearColor)
//   gl.clear(pass.clearFlags ?? (gl.COLOR_CLEAR_VALUE | gl.DEPTH_CLEAR_VALUE))
//   for (const d of pass.drawables) {
//     gl.useProgram(d.program)
//     for (const loc in d.uniforms) {
//       const val = d.uniforms[loc]
//       switch(val.length){
//         case 1:
//           gl.uniform1fv(loc, val)
//           break
//         case 2:
//           gl.uniform2fv(loc, val)
//           break
//         case 3:
//           gl.uniform3fv(loc, val)
//           break
//         case 4:
//           gl.uniform4fv(loc, val)
//           break
//         case 9:
//           gl.uniformMatrix3fv(loc, false, val)
//           break
//         case 16:
//           gl.uniformMatrix4fv(loc, false, val)
//           break
//       }
//     }
//     for (const loc in d.attributes) {
//       const attr = d.attributes[loc];
//       gl.bindBuffer(gl.ARRAY_BUFFER, attr.buffer)
//       gl.vertexAttribPointer(loc, components, type, normalized, 0, 0)
//       gl.enableVertexAttribArray(attribute)
//     }
//   }
// }
