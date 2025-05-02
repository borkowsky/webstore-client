export default function (url: string): any {
  const splitted: string[] = url.split("__")
  return splitted.pop()
}
