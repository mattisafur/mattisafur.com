(function () {
  // add nav bar
  document.querySelector("body").insertAdjacentHTML(
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
    // trim whitespace chars
    preBlock.innerHTML = preBlock.innerHTML.trim();

    preBlock.querySelectorAll("code").forEach((codeBlock) => {
      // format code
      (function () {
        // trim empty lines at start and end
        const trimmedCode = codeBlock.textContent.replaceAll(
          /(^\s*\n)|(\n\s*$)/g,
          ""
        );

        // remove excess indentation
        let lines = trimmedCode.split("\n");
        let minWhitespaces = Number.MAX_VALUE;
        lines.forEach((line) => {
          if (!line.trim()) {
            return;
          }

          minWhitespaces = Math.min(
            minWhitespaces,
            RegExp(/^\s*/).exec(line)[0].length || 0
          );
        });
        lines = lines.map((line) => line.slice(minWhitespaces));

        // surround each line in <span> element
        codeBlock.innerHTML = lines
          .map((line) => `<span>${line}</span>`)
          .join("");
      })();

      // format line numbering
      (function () {
        const lines = codeBlock.querySelectorAll("span");
        const lineDigits = lines.length.toString().length;
        const uniqueClass = `code-${crypto.randomUUID()}`;

        codeBlock.classList.add(uniqueClass);

        const style = document.createElement("style");
        document.head.appendChild(style);
        style.sheet.insertRule(
          `
          code.${uniqueClass} span::before {
            width: ${lineDigits}ch;
          }
          `
        );
      })();
    });
  });
})();
