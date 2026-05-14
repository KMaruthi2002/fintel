# Publishing fintel to PyPI

Step-by-step instructions for uploading the package to TestPyPI (a sandbox) and then to the real PyPI. Read the whole document once before running anything — there are a couple of one-time setup steps.

## 0. One-time setup

### Create accounts (if you don't already have them)

1. **PyPI:** https://pypi.org/account/register/
2. **TestPyPI:** https://test.pypi.org/account/register/

Use the same username on both if you can. They are separate services with separate accounts.

### Verify your email on both sites.

Without email verification you cannot publish.

### Enable two-factor authentication on PyPI (required as of 2024).

After enabling 2FA you must use **API tokens** instead of your password to upload. Generate one token per site:

- PyPI:     https://pypi.org/manage/account/token/
- TestPyPI: https://test.pypi.org/manage/account/token/

When you create the token, set its scope to **"Entire account"** for the very first upload (because the project does not exist yet). After your first successful upload you should regenerate a project-scoped token for safety.

Copy each token immediately. They are shown only once. Tokens look like:

```
pypi-AgEIcHlwaS5vcmcCJDM1ZjQ1...
```

### Store tokens in `~/.pypirc`

Create the file `~/.pypirc` with these contents and replace the two `pypi-...` placeholders:

```ini
[distutils]
index-servers =
    pypi
    testpypi

[pypi]
username = __token__
password = pypi-YOUR-REAL-PYPI-TOKEN-HERE

[testpypi]
repository = https://test.pypi.org/legacy/
username = __token__
password = pypi-YOUR-REAL-TESTPYPI-TOKEN-HERE
```

Then lock it down so no other user on the machine can read it:

```bash
chmod 600 ~/.pypirc
```

**The username is literally the four characters `__token__`. That is not a placeholder.** The actual token goes in the `password` field.

> Note: `~/.pypirc` is listed in `.gitignore` for safety. Do not commit it.

## 1. Pre-flight checklist

From the project root (`/Users/maru/Documents/fintel`), run through these checks each time you publish a new version.

```bash
# Confirm the version you're about to publish
grep -E '^version' pyproject.toml
grep -E '^__version__' fintel/__init__.py

# Both must match. Bump them together if you're publishing a new release.

# Make sure your working tree is clean (optional but recommended)
git status

# Make sure the README renders correctly on PyPI
python3 -m twine check dist/*
```

If you are publishing a new version, **bump the version number in both files first**. PyPI does not allow re-uploading the same version.

## 2. Build the distribution

From the project root:

```bash
# Wipe any previous build artifacts
rm -rf dist build

# Build sdist (.tar.gz) and wheel (.whl)
python3 -m build
```

You should see two files appear in `dist/`:

```
dist/
├── fintel-1.0.0-py3-none-any.whl
└── fintel-1.0.0.tar.gz
```

Validate them before uploading:

```bash
python3 -m twine check dist/*
```

Both lines should print **PASSED**.

## 3. Upload to TestPyPI first

Always upload to TestPyPI before the real one. TestPyPI is a separate sandbox where mistakes have no real consequences.

```bash
python3 -m twine upload --repository testpypi dist/*
```

The command will print a URL when it finishes:

```
View at:
https://test.pypi.org/project/fintel/1.0.0/
```

Open that URL and confirm:

- The README renders correctly (headings, tables, code blocks).
- The metadata is right (description, author, license, classifiers, dependencies).
- The download links work.

### Test-install from TestPyPI

In a fresh virtual environment, install from TestPyPI and try the package:

```bash
python3 -m venv /tmp/fintel_test
source /tmp/fintel_test/bin/activate

# --index-url points to TestPyPI, --extra-index-url falls back to real PyPI
# for dependencies (because pandas/numpy/etc. aren't on TestPyPI).
pip install \
  --index-url https://test.pypi.org/simple/ \
  --extra-index-url https://pypi.org/simple/ \
  fintel

python3 -c "import fintel; print(fintel.__version__)"
deactivate
rm -rf /tmp/fintel_test
```

If the version prints and no errors appear, you're ready for the real release.

## 4. Upload to real PyPI

This is the irreversible step. Once a version is uploaded to PyPI it cannot be re-uploaded with the same version number. You can delete a release but **the version number is forever burned** — even after deletion you cannot re-use it.

```bash
python3 -m twine upload dist/*
```

Output will end with:

```
View at:
https://pypi.org/project/fintel/1.0.0/
```

Anyone can now run `pip install fintel`.

## 5. Verify the public install

In a fresh environment, anywhere on the internet:

```bash
pip install fintel
python3 -c "import fintel; print(fintel.__version__)"
```

That confirms the release is fully published and discoverable.

## 6. Tag the release in git

```bash
git tag v1.0.0
git push origin v1.0.0
```

If you have a GitHub repository, this also lets you create a release page that mirrors the PyPI version.

## Publishing a new version later

When you make changes and want to release v1.0.1, v1.1.0, or v2.0.0:

1. **Edit code** as needed.
2. **Bump the version in two places** (must match exactly):
   - `pyproject.toml` → `version = "1.0.1"`
   - `fintel/__init__.py` → `__version__ = "1.0.1"`
3. **Update README** if the public API changed.
4. **Re-run sections 2 through 5** of this document.
5. **Tag the new version** in git.

### Semantic versioning convention

| Change                                  | Bump        | Example         |
|-----------------------------------------|-------------|------------------|
| Bug fix, no API change                  | PATCH       | 1.0.0 → 1.0.1   |
| New feature, backward-compatible        | MINOR       | 1.0.0 → 1.1.0   |
| Breaking change to the public API       | MAJOR       | 1.0.0 → 2.0.0   |

## Troubleshooting

### "File already exists" on upload

You're trying to re-upload a version that's already on PyPI. Bump the version number and rebuild.

### "Invalid or non-existent authentication information"

Your `~/.pypirc` token is wrong or expired. Re-generate the token on PyPI and update the file.

### README renders badly on PyPI

PyPI is strict about Markdown. Common offenders:

- HTML inside Markdown is partially stripped.
- Relative image links break. Use absolute URLs.
- GitHub-flavoured table syntax works; other extensions may not.

After re-rendering, run `python3 -m twine check dist/*` again.

### Wheel doesn't include all files

Check `pyproject.toml`'s `[tool.setuptools.packages.find]` section. Anything matching `include` is bundled; anything matching `exclude` is omitted.

### `pip install fintel` installs an old version

PyPI's CDN can take a few minutes to propagate after upload. Add `--no-cache-dir` if you're testing immediately:

```bash
pip install --no-cache-dir fintel
```

## What NOT to publish

The `presentation/` folder in this repository contains build scripts for the deck, rubric, and reports. **None of that ships in the wheel** because `pyproject.toml` excludes anything outside `fintel/`. Verify with:

```bash
python3 -c "import zipfile; z = zipfile.ZipFile('dist/fintel-1.0.0-py3-none-any.whl'); print('\n'.join(z.namelist()))"
```

You should only see files under `fintel/` and `fintel-1.0.0.dist-info/`.
