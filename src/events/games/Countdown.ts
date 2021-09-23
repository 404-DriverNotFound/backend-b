export class Countdown {
  defaultCount = 10;

  createdAt: number = Date.now();

  action: () => void = null; // REVIEW what is it?

  constructor(count?: number) {
    this.defaultCount = count || this.defaultCount;
  }

  update(): void {
    const count =
      this.defaultCount - Math.floor((Date.now() - this.createdAt) / 1000);
    if (count < 0) {
      this.action();
    }
  }
}
