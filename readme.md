# City Log Server Backend
Author: CityLog team (Backend: Muzhi Zhang; Frontend: Shan Jiang, Haoyu Yan)

## About This Project
This is the backend part of CityLog website. CityLog is a website that focuses
on building a platform for communities to share ideas on what improvements
can be made in their city and vote on the best suggestions.


### Program Installation
This program requires NodeJs running environment. Required packages are 
in the ```package.json``` file.

### Program options
To get the API documentation and usage, visit this public postman workspace:  

https://www.postman.com/zmz0072000/workspace/citylog

To adjust options, change the variables in the ```.env``` file  

|Variable | Meaning|
|--------- | --------|
DATABASE_URL|postgres url for the database
SECRET|secret used for token generation
PORT|port for the server
EMAIL_HOST|smtp email host
EMAIL_PORT|smtp email port
EMAIL_USER|smtp username
EMAIL_PASS|smtp password
EMAIL_LINK|First part of password reset link (decided by frontend member)


### Program running instruction and outputs
- Before starting the server, initialize the database using ```npm run forceSync```  
  **WARNING**: doing this will wipe out all data in existing database!
```bash
(base) Muzhi-Macbook:city-log-server muzhizhang$ npm run forceSync

> city-log-server@1.0.0 forceSync
> node ForceSync.js

Force sync finished.
Force Sync Script finished successfully.
```

- To start the server, use ```npm run start```
```bash
(base) Muzhi-Macbook:city-log-server muzhizhang$ npm run start

> city-log-server@1.0.0 start
> node server.js

Application running on the port:  3010
```


### File Structure
This backend part of server contains 3 layers of structures below the app:
- Routes: shows the url used by each controller. 6 routes can be found in ```routes``` folder
- Controllers: controllers in this project are only for retrieve data and sending message. Message
will be produced from services. 6 controllers can be found in ```controllers``` folder
- Services: services in this project uses variables as input and all has Message class 
  (shown in ```/utils/Message.js```) as output.  
  
For specific usage of each file, see JSDoc comment in each file.
### Testing
To run the automated testing script, use ```npm run test```

### Test result
```bash
(base) Muzhi-Macbook:city-log-server muzhizhang$ npm run test

> city-log-server@1.0.0 test
> jest

  console.log
    Force sync finished.

      at forceSync (src/model/Database.js:129:17)

  console.log
    REGISTER STARTED

      at Object.register (src/service/user.service.js:44:17)

  console.log
    [WARNING] FAIL MESSAGE SENT: Register error: user already exists
...

 PASS  ./user.test.js
  ✓ 1: user (377 ms)
  ✓ 2: ticket (427 ms)
  ✓ 3: reply (393 ms)
  ✓ 4: history & city (216 ms)

Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
Snapshots:   0 total
Time:        2.245 s, estimated 3 s
Ran all test suites.
  console.log
    create ticket: success

...

```