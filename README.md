# Spotify Dashboard

![GitHub License](https://img.shields.io/badge/license-MIT-blue.svg)

Welcome to the **Spotify Dashboard** project! This application provides a comprehensive dashboard for managing and visualizing your Spotify account's listening data. The backend is built using Node and Prisma, while the frontend is built using Next.js and TailwindCSS.

## Table of Contents

- [Spotify Dashboard](#spotify-dashboard)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Setting Up](#setting-up)
    - [Docker](#docker)

## Features

- **Profile Overview**: Get an overview of your Spotify profile information.
- **Top Tracks and Artists**: View your most played tracks and artists.
- **Listening History**: Explore your recent listening history with intuitive visuals.
- **Search**: Search for tracks, albums, and artists on Spotify.

## Setting Up

### Docker

1. Go to https://developer.spotify.com/dashboard/ and create a new application.
   1. Add `http://localhost:3000/api/auth/callback/spotify` as a redirect URI.
   2. Add `<Your_Domain>/api/auth/callback/spotify` as a redirect URI.
2. Run the image with the following command:

```bash
docker run -d \
    --publish 3000:3000 \
    --env SPOTIFY_CLIENT_ID=<CLIENT_ID> \
    --env SPOTIFY_CLIENT_SECRET=<CLIENT_SECRET> \
    --env JWT_TOKEN_SECRET=<Generated 64 character string> \
    --env DATABASE_URL=<PostgreSQL connection string> \
    --env PUBLIC_URL=<Your_Domain> \
    --name spotify-dashboard \
    ghcr.io/behnh/spotify-dashboard:latest
```