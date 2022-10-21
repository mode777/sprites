export interface ActiveInfoEx extends WebGLActiveInfo {
  location?: number | WebGLUniformLocation
}

export class ShaderProgram {

  private program: WebGLProgram;
  public readonly attributes: { [key: string]: ActiveInfoEx; } = {};
  public readonly uniforms: { [key: string]: ActiveInfoEx; } = {};

  constructor(private gl: WebGLRenderingContext, vertexSource: string, fragmentSource: string) {
    this.program = this.compileProgam(gl, vertexSource, fragmentSource);
    const attributes = gl.getProgramParameter(this.program, gl.ACTIVE_ATTRIBUTES);
    const uniforms = gl.getProgramParameter(this.program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < attributes; i++) {
      const a: ActiveInfoEx = gl.getActiveAttrib(this.program, i);
      a.location = gl.getAttribLocation(this.program, a.name);
      this.attributes[a.name] = a;
    }
    for (let i = 0; i < uniforms; i++) {
      const u: ActiveInfoEx = gl.getActiveUniform(this.program, i);
      u.location = gl.getUniformLocation(this.program, u.name);
      this.uniforms[u.name] = u;
    }
  }

  private compileShader(gl, type, src) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const err = new Error(gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      throw err;
    }
    return shader;
  }

  private compileProgam(gl, vSource, fSource) {
    const vertex = this.compileShader(gl, gl.VERTEX_SHADER, vSource);
    const fragment = this.compileShader(gl, gl.FRAGMENT_SHADER, fSource);

    const program = gl.createProgram();
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      gl.deleteProgram(program);
      throw new Error(gl.getProgramInfoLog(program));
    } else {
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      return program;
    }
  }

  public setUniform(name: string, ...values: number[]) {
    const u = this.uniforms[name];
    if (!u) {
      console.warn('Uniform not found: ' + name);
      return;
    }
    this.applyUniform(this.gl, u.type, <WebGLUniformLocation>u.location, values);
  }

  private applyUniform(gl: WebGLRenderingContext, type: number, loc: WebGLUniformLocation, val: number[]) {
    switch (type) {
      case gl.FLOAT:
        return gl.uniform1fv(loc, val);
      case gl.FLOAT_VEC2:
        return gl.uniform2fv(loc, val);
      case gl.FLOAT_VEC3:
        return gl.uniform3fv(loc, val);
      case gl.FLOAT_VEC4:
        gl.uniform4fv(loc, val);
      case gl.FLOAT_MAT2:
        return gl.uniformMatrix2fv(loc, false, val);
      case gl.FLOAT_MAT3:
        return gl.uniformMatrix3fv(loc, false, val);
      case gl.FLOAT_MAT4:
        return gl.uniformMatrix4fv(loc, false, val);
      case gl.INT:
      case gl.BOOL:
      case gl.SAMPLER_2D:
      case gl.SAMPLER_CUBE:
        return gl.uniform1iv(loc, val);
      case gl.INT_VEC2:
      case gl.BOOL_VEC2:
        return gl.uniform2iv(loc, val);
      case gl.INT_VEC3:
      case gl.BOOL_VEC3:
        return gl.uniform3iv(loc, val);
      case gl.INT_VEC4:
      case gl.BOOL_VEC4:
        return gl.uniform4iv(loc, val);
      default:
        throw new Error('Invalid type: ' + type);
    }
  }

  use() {
    this.gl.useProgram(this.program);
  }
}
