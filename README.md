# linagora.esn.ticketing
>This is OpenPaaS Module for ticketing feature

[![build status](https://ci.linagora.com/linagora/lgs/openpaas/linagora.esn.ticketing/badges/master/build.svg)](https://ci.linagora.com/linagora/lgs/openpaas/linagora.esn.ticketing/commits/master)

## Install

Make sure you have OpenPaaS installed from [here](https://ci.linagora.com/linagora/lgs/openpaas/linagora.esn.ticketing/wikis/installation)

### Add the module to OpenPaaS

Add the line `linagora.esn.ticketing` to `esn/config/default.json` in modules section
Add the line `"linagora.esn.ticketing": "linagora/linagora.esn.ticketing"` to `esn/packages.json` in dependencies section

### Install the node packages for the ticketing module

In the `esn` folder do
```
npm install
```

### Launch OpenPaaS

In the `esn` folder
```
npm start
```

### Configuration

Set the frontend Url (needed to add link to request in email)

Use Curl to set configuration:
```
curl -X PUT -H 'Accept: application/json' -H 'Content-Type: application/json'  http://0.0.0.0:8080/api/configurations?scope=platform -u "ADMIN_USERNAME:PASSWORD"  -d '[
  {
    "name": "linagora.esn.ticketing",
    "configurations": [
      {
        "name": "frontendUrl",
        "value": "http://ticketingServeur:port"
      }
    ]
  }
]'
```

Set the _from_ and default responsible addresses for email

Use Curl to set configuration:
```
curl -X POST -H 'Accept: application/json' -H 'Content-Type: application/json'  http://0.0.0.0:8080/api/configurations?scope=platform -u "ADMIN_USERNAME:PASSWORD"  -d '[
  {
    "name": "linagora.esn.ticketing",
    "configurations": [
      {
        "name" : "mail",
        "value" : {
          "replyto" : "ossa-dev@linagora.com",
          "noreply" : "noreply-dev@linagora.com",
          "support" : "ossa-dev@linagora.com"
        }
      }
    ]
  }
]'
```


> **PS**  You need to use ``` \n ``` to attach the lines.

### Accessing the ticketing module

The ticketing module can be accessed at the adress : [Ticketing module](http://localhost:8080/#/ticketing) (/#/ticketing)
The ticketing module admin platform can be accessed at the adress : [Admin platform](http://localhost:8080/#/ticketing/admin) (/#/ticketing/admin)

### [Development document](./doc/dev.md)
### [CLI document](./doc/cli.md)

## F.A.Q.

> User autocompletion in the ticketing module is not working.

You should reindex user data from the database to in elasticsearch. In the `esn` folder do

```bash
$ node ./bin/cli reindex --es-host localhost --es-port 9200 --type users
```

> Cannot access ticketing admin center

Because you does not have administrator permission. In the `esn/node_modules/linagora.esn.ticketing` folder do:

```
$ node ./bin/cli role --email your@mail.com --role administrator
```
