function getLanguage(pre: Element, code: Element | null): string {
  const fromData = pre.getAttribute("data-language") ?? code?.getAttribute("data-language");
  if (fromData) return fromData;
  const classes = `${pre.getAttribute("class") ?? ""} ${code?.getAttribute("class") ?? ""}`;
  const match = /language-([\w+-]+)/.exec(classes);
  return match ? match[1] : "text";
}

const feedbackTimers = new WeakMap<HTMLButtonElement, number>();

function showFeedback(button: HTMLButtonElement, feedback: HTMLElement, message: string): void {
  window.clearTimeout(feedbackTimers.get(button));
  feedback.textContent = message;
  button.textContent = message === "Copied" ? "Copied" : "Copy failed";
  feedbackTimers.set(
    button,
    window.setTimeout(() => {
      button.textContent = "Copy";
      feedback.textContent = "";
    }, 2500),
  );
}

async function copyText(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    return;
  } catch {
    // Older browsers and denied Clipboard API permissions may allow a user-initiated copy.
    const previousFocus = document.activeElement;
    const input = document.createElement("textarea");
    input.value = text;
    input.readOnly = true;
    input.style.cssText = "position:fixed;inset:0 auto auto 0;opacity:0;pointer-events:none";
    document.body.append(input);
    input.select();
    input.setSelectionRange(0, text.length);
    let copied = false;
    try {
      copied = document.execCommand("copy");
    } finally {
      input.remove();
      if (previousFocus instanceof HTMLElement) previousFocus.focus({ preventScroll: true });
    }
    if (!copied) throw new Error("Clipboard access is unavailable");
  }
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
    header.setAttribute("data-pagefind-ignore", "");

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
    feedback.className = "code-block-feedback sr-only";
    feedback.setAttribute("role", "status");
    feedback.setAttribute("aria-live", "polite");

    button.addEventListener("click", async () => {
      const text = code ? (code.textContent ?? "") : "";
      button.disabled = true;
      try {
        await copyText(text);
        showFeedback(button, feedback, "Copied");
      } catch {
        showFeedback(button, feedback, "Copy failed. Select the code and copy it manually.");
      } finally {
        button.disabled = false;
      }
    });

    header.append(label, button, feedback);

    const wrapper = document.createElement("div");
    wrapper.className = "code-block";
    pre.replaceWith(wrapper);
    wrapper.append(header, pre);
  });
}
