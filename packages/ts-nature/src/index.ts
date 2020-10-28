import { chainPromiseCreators } from './utils'

export interface Nature<T> {
    schema: T
    evolutions: T[]
    devolutions: T[]
    execute: (mutation: T) => Promise<any>
    getVersion: () => Promise<number>
    updateVersion: (version: number) => Promise<any>
}

// If version number is zero schema will be created
// else evolutions will be run in order from version - 1
//
// Version will be updated to N evolutions + 1
export async function evolve<T>(nature: Nature<T>): Promise<any> {
    return nature
        .getVersion()
        .then((version) => {
            return version === 0
                ? nature.execute(nature.schema)
                : chainPromiseCreators(
                      ...nature.evolutions
                          .slice(version - 1)
                          .map((evolution) => () => nature.execute(evolution))
                  )
        })
        .then(() => nature.updateVersion(nature.evolutions.length + 1))
}

// All devolutions will be run in order
//
// Version will be updated to version - N devolutions
export async function devolve<T>(nature: Nature<T>): Promise<any> {
    if (nature.devolutions.length === 0) {
        return Promise.resolve()
    }

    return chainPromiseCreators(
        ...nature.devolutions.map((devolution) => () =>
            nature.execute(devolution)
        )
    )
        .then(() => nature.getVersion())
        .then((version) =>
            nature.updateVersion(version - nature.devolutions.length)
        )
}

// Will first run evolve, then devolve
export async function mutate<T>(nature: Nature<T>): Promise<any> {
    return evolve(nature).then(() => devolve(nature))
}

export default mutate
