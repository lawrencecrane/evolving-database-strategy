export interface Nature {}

const evolve = (nature: Nature): Promise<any> => Promise.resolve()

const devolve = (nature: Nature): Promise<any> => Promise.resolve()

export const mutate = (nature: Nature): Promise<any> =>
    evolve(nature).then(() => devolve(nature))

export default mutate
