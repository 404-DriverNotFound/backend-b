export class Countdown {
  count = 10;

  left = 0;

  createdAt: number = Date.now();

  action: () => void = null;

  constructor(count?: number) {
    if (count) {
      this.count = count;
    }
  }

  update(): void {
    this.left = this.count - Math.floor((Date.now() - this.createdAt) / 1000);

    if (this.left < 0) {
      this.action();
    }
  }
}
