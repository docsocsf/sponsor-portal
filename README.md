# DoCSoc Portal for Members and Sponsors

## Develop
---
(This will not affect the actual db or files saved, use this for test and local developing)
### Dependencies
* [MongoDB](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/)
* Kerbersos Client `libkrb5-dev` (only needed for install. will not be used in dev)
* npm 5.6+ `npm`
* node 8.11.3+ `node`

### Build and Run
1. start Mongod `sudo service mongod start`
2. `npm install` (will need sudo access)
3. `npm run local` (will need sudo access)

### Usage
* Access from `http://localhost`
* Member login with blank username and password
* Sponsor login with `gold` / `silver` / `bronze` username, and same for password
* `localhost/admin` login with blank username and password
* Recomended testing:
  * Login to sponsors and add positions, news and info
  * Login to member and interact with sponsors
  * Login to admin and add/edit/remove sponsors


## Prodction (will only work on imperial VM)
---
### Dependencies
* [MongoDB](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/)
* docker

### Build and Run
1. `update-portal`