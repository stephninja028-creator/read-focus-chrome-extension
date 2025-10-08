# GitHub Setup Instructions

## 1. Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `read-focus-chrome-extension`
3. Description: `Chrome extension for focused reading with text highlighting and note-taking features`
4. Make it **Public** (required for GitHub Pages)
5. **Don't** check "Add a README file"
6. **Don't** check "Add .gitignore" 
7. **Don't** check "Choose a license"
8. Click "Create repository"

## 2. Push Your Code

After creating the repository, run these commands in your terminal:

```bash
cd "/Users/ppg20/Desktop/AIGC/AI product build/read focus safari extension"

# Add the GitHub repository as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/read-focus-chrome-extension.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## 3. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click "Settings" tab
3. Scroll down to "Pages" section
4. Under "Source", select "Deploy from a branch"
5. Select "main" branch and "/ (root)" folder
6. Click "Save"

## 4. Privacy Policy URL

Once GitHub Pages is enabled, your privacy policy will be available at:
`https://YOUR_USERNAME.github.io/read-focus-chrome-extension/privacy-policy.html`

## 5. Update Chrome Web Store Submission

Use the privacy policy URL above when submitting to Chrome Web Store.
