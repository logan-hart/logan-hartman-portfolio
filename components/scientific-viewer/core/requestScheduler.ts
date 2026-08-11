/**
 * Small per-viewer request pool. Giving baseline and progressive viewers the
 * same cap prevents either one from monopolizing the browser's per-origin
 * connection pool when a cold comparison starts both at once.
 */
export class RequestScheduler {
  private active = 0;
  private readonly queue: Array<() => void> = [];

  constructor(private readonly concurrency: number) {
    if (!Number.isInteger(concurrency) || concurrency < 1) {
      throw new Error("RequestScheduler concurrency must be a positive integer.");
    }
  }

  run<T>(task: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const start = () => {
        this.active += 1;
        void task()
          .then(resolve, reject)
          .finally(() => {
            this.active -= 1;
            this.queue.shift()?.();
          });
      };

      if (this.active < this.concurrency) start();
      else this.queue.push(start);
    });
  }
}
