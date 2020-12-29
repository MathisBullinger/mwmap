export default class Viewport {
  constructor(
    public x: number,
    public y: number,
    public w: number,
    public h: number
  ) {}

  static fromCenter(x: number, y: number, vMin = 100) {
    const ratio = window.innerHeight / window.innerWidth
    const width = ratio > 1 ? vMin : (1 / ratio) * vMin
    const height = ratio < 1 ? vMin : ratio * vMin
    return new Viewport(x - width / 2, y - height / 2, width, height)
  }

  public get center(): [x: number, y: number] {
    const x = this.x + this.w / 2
    const y = this.y + this.h / 2
    return [x, y]
  }

  public set center([x, y]: [x: number, y: number]) {
    this.x = x - this.w / 2
    this.y = y - this.h / 2
  }

  public get vMin(): number {
    return Math.min(this.w, this.h)
  }

  public set vMin(v: number) {
    const ratio = window.innerHeight / window.innerWidth
    if (ratio < 1) {
      this.h = v
      this.w = (1 / ratio) * v
    } else {
      this.w = v
      this.h = ratio * v
    }
  }

  public resize() {
    const vMin = this.vMin
    const center = this.center
    this.vMin = vMin
    this.center = center
  }
}
