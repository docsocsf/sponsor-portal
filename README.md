# DoCSoc Portal for Members and Sponsors

## Develop

### Dependencies
* [MongoDB](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/)
* npm 5.6+ `npm`
* node 8.11.3+ `node`

### Build and Run
1. start Mongod `sudo service mongod start`
2. `npm install`
3. `npm run dev` (will need sudo access)



## Prodction (will only work on imperial VM)

### Dependencies
* [MongoDB](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/)
* Kerbersos Client `libkrb5-dev` (server must be in IC network. VPN works)
* npm 5.6+ `npm`
* node 8.11.3+ `node`

### Build and Run
1. `update-portal`