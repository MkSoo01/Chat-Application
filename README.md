# Chat Application

Real-time chat application where users can interact with each other by sending messages. This app is developed with React.js while the server side developed with Express.js.

## Features

- Register an account and log in
- Add friends into contacts
- Chat privately with anyone in the contacts

## Screenshots

![App Screenshot](https://github.com/MkSoo01/Chat Application/blob/master/screenshots/screenshot.PNG)

## Tech Stack & Open-source libraries

- [Eslint](https://eslint.org/docs/user-guide/getting-started) - static code analysis tool for Javascript
- [Prettier](https://prettier.io/docs/en/index.html) - code formatter tool
- [Jest](https://jestjs.io/docs/getting-started) - JavaScript testing framework
- [Bcryptjs](https://github.com/dcodeIO/bcrypt.js) - password-hashing library
- Server
  - [Express.js](http://expressjs.com/en/starter/installing.html) - backend web applicatin framework for Node.js
  - [JsonWebToken](https://github.com/auth0/node-jsonwebtoken) - create and verify the access token for authentication system
  - [Mongoose](https://mongoosejs.com/docs/) - library for MongoDB
  - [Socket.io](https://socket.io/docs/v4/) - JavaScript library for real-time, bi-directional communication between web clients and servers.
  - [Sinon-mongoose](https://github.com/underscopeio/sinon-mongoose) - used to mock for Mongoose methods in unit tests
- Client
  - [React.js](https://reactjs.org/docs/getting-started.html) - Frond-end Javascript library
  - [Material UI](https://mui.com/getting-started/installation/) - React UI library
  - [Axios](https://axios-http.com/docs/intro) - Promise based HTTP client
  - [React-final-form](https://final-form.org/docs/react-final-form/getting-started) - Form state management library
  - [React-router](https://reactrouter.com/docs/en/v6/getting-started/installation) - React JavaScript routing library
  - [Socket.io-client](https://socket.io/docs/v4/client-installation/) - Socket.IO client library
  - [Vite](https://vitejs.dev/guide/) - JavaScript module bundler

## Demo

![App Demo](https://github.com/MkSoo01/Pokedex/blob/master/demo/demo.gif)

## Setup

- run `npm i && npm run start` for both client and server side to start the development server

## Refrences

- [project_chat_application](https://github.com/adrianhajdin/project_chat_application)
- [ReactJS application architecture overview](https://medium.com/geekculture/react-js-architecture-features-folder-structure-design-pattern-70b7b9103f22)

## License

```
Copyright 2022 MkSoo01

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```
