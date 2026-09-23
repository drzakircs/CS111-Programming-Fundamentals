# CS111 Programming Fundamentals — GitHub Pages

Course portal for CS111 Programming Fundamentals.

## Automatic material discovery

Upload HTML files into the `materials/` directory. The site detects the week number from the filename and lists every matching HTML file under that week.

Supported examples:

- `CS111_Programming_Fundamentals_Week2.html`
- `CS111_Programming_Fundamentals_Week02_Part1.html`
- `CS111_Programming_Fundamentals_Week02_Examples.html`
- `week-02-extra-practice.html`

A week may contain one file or many files. No edit to `data/course.json` is required when new HTML material is added.

The main page uses GitHub Pages/Jekyll to discover files at build time. A GitHub API fallback is also included for local/static testing.
