function getLanguage(pre: Element, code: Element | null): string {
  const fromData = pre.getAttribute("data-language") ?? code?.getAttribute("data-language");
  if (fromData) return fromData;
  const classes = `${pre.getAttribute("class") ?? ""} ${code?.getAttribute("class") ?? ""}`;
  const match = /language-([\w+-]+)/.exec(classes);
  return match ? match[1] : "text";
}

function showFeedback(button: HTMLButtonElement, feedback: HTMLElement, message: string): void {
  feedback.textContent = message;
  const original = "Copy";
  button.textContent = message === "Copied" ? "Copied" : "Copy failed";
  window.setTimeout(() => {
    button.textContent = original;
    feedback.textContent = "";
  }, 2000);
}

export function initializeCodeBlocks(): void {
  const pres = document.querySelectorAll(".prose pre");
  pres.forEach((pre) => {
    if (!(pre instanceof HTMLElement)) return;
    if (pre.dataset.codeBlockEnhanced === "true") return;
    pre.dataset.codeBlockEnhanced = "true";

    const code = pre.querySelector("code");
    const language = getLanguage(pre, code);

    const header = document.createElement("div");
    header.className = "code-block-header";

    const label = document.createElement("span");
    label.className = "code-block-lang";
    label.textContent = language;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "code-block-copy";
    button.textContent = "Copy";
    button.setAttribute("aria-label", `Copy ${language} code to clipboard`);
    button.setAttribute("data-pagefind-ignore", "");

    const feedback = document.createElement("span");
    feedback.className = "code-block-feedback";
    feedback.setAttribute("role", "status");
    feedback.setAttribute("aria-live", "polite");

    button.addEventListener("click", async () => {
      const text = code ? (code.textContent ?? "") : "";
      if (
        typeof navigator === "undefined" ||
        !navigator.clipboard ||
        typeof navigator.clipboard.writeText !== "function"
      ) {
        showFeedback(button, feedback, "Copy not available in this browser");
        return;
      }
      try {
        await navigator.clipboard.writeText(text);
        showFeedback(button, feedback, "Copied");
      } catch {
        showFeedback(button, feedback, "Copy failed");
      }
    });

    header.append(label, button, feedback);

    const wrapper = document.createElement("div");
    wrapper.className = "code-block";
    pre.replaceWith(wrapper);
    wrapper.append(header, pre);
  });
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeCodeBlocks, {
      once: true,
    });
  } else {
    initializeCodeBlocks();
  }
  document.addEventListener("astro:after-swap", initializeCodeBlocks);
}
