import unified from 'unified';

export const json = unified().use(fromJson).use(toJson).freeze();

export function fromJson(this: any) {
  this.Parser = (node: any, file: any) => {
    return file.result || JSON.parse(node);
  };
}
export function toJson(this: any) {
  this.Compiler = (node: any) => {
    return node;
  };
}

export default json;
