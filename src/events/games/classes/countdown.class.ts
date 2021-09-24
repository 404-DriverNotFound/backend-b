export class Countdown {
  count = 10;

  createdAt: number = Date.now();

  action: () => void = null;

  constructor(count?: number) {
    if (count) {
      this.count = count;
    }
  }

  update(): void {
    const left: number =
      this.count - Math.floor((Date.now() - this.createdAt) / 1000);

    if (left < 0) {
      this.action();
    }
  }
}
