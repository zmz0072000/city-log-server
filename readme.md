# City Log Server Backend
Author: CityLog team (Backend: Muzhi Zhang; Frontend: Shan Jiang, Haoyu Yan)

## About This Project
This is the backend part of CityLog website. CityLog is a website that focuses
on building a platform for communities to share ideas on what improvements
can be made in their city and vote on the best suggestions.


### Program Installation
This program requires NodeJs running environment. Required packages are 
listed in the ```package.json``` file

### Program options
To adjust options, change the variables in the ```.env``` file

### Program running instruction and outputs
- To start the server, use ```npm run start```
```bash
(base) Muzhi-Macbook:city-log-server muzhizhang$ npm run start

> city-log-server@1.0.0 start
> node server.js

Application running on the port:  3010
```


### File Structure


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