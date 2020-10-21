# software engineering project

## How to run

1. Run `npm install`
1. Copy the `.env.example` file to `.env`, and make changes if necessary
1. To start the server, run `npm start`
1. The server will take a while to compile in development mode, so wait until
   it prints "compiled successfully" before opening the page
1. Default port is 8064, this can be changed in the configuration file (`.env`)

For production builds, run `npm build` to compile everything, then run
`node build/server.js`
