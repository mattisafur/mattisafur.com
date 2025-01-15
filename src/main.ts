// add header
document.querySelector("body")?.insertAdjacentHTML(
  "afterbegin",
  `
  <header>
    <nav>
      <ul>
        <li>
          <a href="/">[Home]</a>
        </li>
        <li>
          <a href="/projects">[Projects]</a>
        </li>
      </ul>
    </nav>
  </header>
  `
);

// format code blocks
document.querySelectorAll("pre:has(code)").forEach((preBlock) => {
  // trim whitespaces from pre tag
  preBlock.innerHTML = preBlock.innerHTML.trim();

  preBlock.querySelectorAll("code").forEach((codeBlock) => {
    trimExcessiveIndentation(codeBlock);
    formatLineNumbering(codeBlock);
  });
});

function trimExcessiveIndentation(codeBlock: HTMLElement): void {
  if (!codeBlock.textContent) return;

  const trimmedCode = codeBlock.textContent.replaceAll(
    /(^\s*\n)|(\n\s*$)/g,
    ""
  );

  let lines = trimmedCode.split("\n");
  let minWhitespaces = Number.MAX_VALUE;
  lines.forEach((line) => {
    if (!line.trim()) return;

    minWhitespaces = Math.min(
      minWhitespaces,
      RegExp(/^\s*/).exec(line)?.[0].length || 0
    );
  });
  lines = lines.map((line) => `<span>${line.slice(minWhitespaces)}</span>`);
  codeBlock.innerHTML = lines.join("\n");
}

function formatLineNumbering(codeBlock: HTMLElement): void {
  const digitCount = codeBlock
    .querySelectorAll("span")
    .length.toString().length;

  const uniqueClass = `code-${crypto.randomUUID()}`;
  codeBlock.classList.add(uniqueClass);

  const style = document.createElement("style");
  document.head.appendChild(style);
  style.sheet?.insertRule(`
    code.${uniqueClass} span::before {
      width: ${digitCount};
    }
    `);
}
