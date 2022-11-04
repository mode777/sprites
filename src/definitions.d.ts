declare module "*.glsl" {
    const content: string;
    export default content;
  }
  
interface WeakRef<T> { 
    deref(): any
}
interface WeakRefConstructor<T> {
    new(value:any): WeakRef<T>;
}
declare var WeakRef: WeakRefConstructor<any>;

declare var showOpenFilePicker: any