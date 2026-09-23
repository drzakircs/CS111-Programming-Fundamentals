# CS111 Programming Fundamentals — GitHub Pages Starter

This is a static course portal for GitHub Pages.

## 1. Repository structure

```text
/
├── index.html
├── data/
│   └── course.json
├── assets/
│   ├── css/style.css
│   └── js/app.js
└── materials/
    ├── week-01.html
    ├── week-02.html
    ├── ...
    └── week-15.html
```

## 2. Add your weekly HTML material

Place your own files in the `materials/` directory using these names:

- `week-01.html`
- `week-02.html`
- ...
- `week-15.html`

If your filenames are different, update the `material` value for that week inside `data/course.json`.

## 3. Publish with GitHub Pages

1. Create a GitHub repository, for example `CS111-Programming-Fundamentals`.
2. Upload all files in this starter folder to the repository root.
3. Commit and push to the `main` branch.
4. In the repository, open **Settings → Pages**.
5. Select **Deploy from a branch**.
6. Choose branch **main** and folder **/(root)**.
7. Save. GitHub will publish the site after deployment completes.

## 4. Important note about local preview

The page loads `data/course.json` with JavaScript `fetch()`. Browsers often block this when `index.html` is opened directly with a `file://` path.

Use one of these instead:

- GitHub Pages, or
- VS Code Live Server, or
- `python -m http.server 8000`

Then open `http://localhost:8000/`.

## 5. Embedding behavior

Click **View material** on any week. The corresponding weekly HTML file opens inside the embedded iframe viewer on the same page.

If a weekly file has not been uploaded yet, the iframe will show a 404 page. Once you add that file at the configured path, the same button will work automatically.
