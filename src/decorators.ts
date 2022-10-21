import { ReflectionManager } from "./reflection-manager"

export type ClassDecorator = (constructor: any) => void
export type PropertyDecorator = (instance: any, property: string) => void

export function node(id): ClassDecorator {
    return target => {
        ReflectionManager.addMetadata(window, '__nodes', { id, target })
        ReflectionManager.addMetadata(target, 'node_id', id)
    }
}

export function serialize(): PropertyDecorator {
    return (inst, name) => ReflectionManager.addMetadata(inst, 'fields', name) 
}

