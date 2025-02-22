type Subclass<T> = new (...args: any[]) => T & { name: string }
export default Subclass
