# OpenRouter Chat — Setup

## Requirements

* Node.js 18+
* npm
* OpenRouter API key

---

## Linux

### Fedora

```bash
sudo dnf install nodejs npm
```

### Ubuntu / Debian

```bash
sudo apt update
sudo apt install nodejs npm
```

### Arch Linux

```bash
sudo pacman -S nodejs npm
```

Check:

```bash
node -v
npm -v
```

---

## Windows

Install **Node.js LTS** from:

```text
https://nodejs.org/
```

Then open PowerShell or Command Prompt:

```powershell
node -v
npm -v
```

---

## Install Project Libraries

Inside the project folder:

```bash
npm install express dotenv
```

Optional — development auto-reload:

```bash
npm install --save-dev nodemon
```

---

## `.env`

Create a file named:

```text
.env
```

Put it in the same directory as `server.js`.

```env
OPENROUTER_API_KEY=sk-or-v1-YOUR_API_KEY_HERE
PORT=3000
```

Replace `YOUR_API_KEY_HERE` with your OpenRouter API key.

---

## `.gitignore`

Create:

```text
.gitignore
```

Add:

```gitignore
node_modules/
.env
```

---

## Run

```bash
node server.js
```

Or, if using nodemon:

```bash
npx nodemon server.js
```

Open:

```text
http://localhost:3000
```
