# Signal Portfolio

An interactive, dependency-free Node.js portfolio starter prepared for Coolify.

## Customize

Edit `dist/content.js` to change the name, introduction, email, domain, projects and social links. Edit the descriptive text in `dist/index.html` if you want to change the about section.

## Run locally

```bash
npm start
```

Open `http://localhost:3000`.

## Deploy on Coolify

1. Upload this project to a Git repository.
2. In Coolify, create a resource from that repository.
3. Select Nixpacks as the build pack.
4. Set **Ports Exposes** to `3000`.
5. Set **Domains** to `https://a.xn--1ea.cc`.
6. Deploy.

The server reads Coolify's `PORT` environment variable and listens on `0.0.0.0`.
