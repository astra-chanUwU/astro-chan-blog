import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => setCount((currentCount) => currentCount - 1)}
        aria-label="Decrement counter"
        className="rounded-md bg-neutral-200 px-3 py-1 text-sm font-medium hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700"
      >
        −
      </button>
      <output aria-live="polite" className="min-w-20 text-center font-mono text-sm">
        Count: {count}
      </output>
      <button
        type="button"
        onClick={() => setCount((currentCount) => currentCount + 1)}
        aria-label="Increment counter"
        className="rounded-md bg-neutral-200 px-3 py-1 text-sm font-medium hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700"
      >
        +
      </button>
      <button
        type="button"
        onClick={() => setCount(0)}
        className="rounded-md px-3 py-1 text-sm text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
      >
        Reset
      </button>
    </div>
  );
}
