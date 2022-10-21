import { serialize } from "./decorators";
import { createGuid, ReflectionManager } from "./reflection-manager";

export abstract class Node {

  private children: Node[] = [];
  private readonly lookup: { [key: string]: Node; } = {};
  public parent: Node = null;

  public static createNode(name: string, values = null): Node {
    const nodes = ReflectionManager.getMetadata(window, '__nodes');
    const node = nodes.find(x => x.id === name);
    if (!node)
      throw new Error('Cannot create node of type: ' + name);
    return new node.target(values);
  }
  public static parseNode(values: any) {
    return this.createNode(values.__type, values);
  }

  private static instanceRegistry = new Map<string, WeakRef<Node>>();

  public static getInstance(instanceId: string) {
    const ref = this.instanceRegistry.get(instanceId);
    if (!ref)
      throw new Error('InstanceId not found');
    const inst = ref.deref();
    if (!inst) {
      this.instanceRegistry.delete(instanceId);
      throw new Error('Instance no longer exists');
    }
    return inst;
  }

  @serialize()
  public name: string;

  @serialize()
  public instanceId: string;

  constructor(values: any = null) {
    if (values)
      this.deserialize(values);
    if (!this.instanceId)
      this.instanceId = createGuid();
    Node.instanceRegistry.set(this.instanceId, new WeakRef(this));
  }

  serialize() {
    const obj = {};
    const fields = ReflectionManager.getMetadata(this, 'fields');
    for (const field of fields) {
      obj[field] = this[field];
    }
    const typeid = ReflectionManager.getMetadata(this.constructor, 'node_id');
    const id = typeid[0];
    if (!id)
      throw new Error('Cannot serialize node as there is no node id. Are you missing a node() decorator?');
    obj['__type'] = id;
    obj['children'] = this.children.map(x => x.serialize());
    return obj;
  }

  deserialize(obj: any) {
    const fields = ReflectionManager.getMetadata(this, 'fields');
    for (const field of fields) {
      this[field] = obj[field];
    }
    if (obj.children) {
      for (const child of obj.children) {
        const inst = Node.createNode(child.__type, child);
        this.addChild(inst);
      }
    }
  }

  addChild(child: Node) {
    this.children.push(child);
    child.parent = this;
    if (child.name)
      this.lookup[child.name] = child;

  }

  removeChild(child: Node) {
    this.children = this.children.filter(x => x !== child);
    child.parent = null;
  }

  private getRoot() {
    return this.parent?.getRoot() ?? this;
  }

  getNodeArr(pathFrags: string[]): Node {
    if (pathFrags.length === 0)
      return this;
    const id = pathFrags.shift();
    if (id === '..')
      return this.parent?.getNodeArr(pathFrags);
    else if (id === '.')
      return this.getNodeArr(pathFrags);
    else
      return this.lookup[id]?.getNodeArr(pathFrags);
  }

  getNode<T extends Node>(path: string) {
    if (path.length === 0)
      return this;
    if (path[0] === '/')
      return <T>this.getRoot().getNode(path.substring(1));
    else
      return <T>this.getNodeArr(path.split('/'));
  }
}
