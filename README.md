# logstash-bunyan

Logstash UDP stream for Bunyan

## Credits

Thanks Justin Rainbow for the package. I took over the package due to some found out bugs.

## How-to

### Installation

With NPM:

```bash
npm install izonder/bunyan-logstash
```

With Yarn:

```bash
yarn add izonder/bunyan-logstash
```

Adding specific version:

```bash
yarn add izonder/bunyan-logstash#0.4.3
```

### Configuration options

|Option|Type|Default|
|---|---|---|
|**level**|string|`info`|
|**server**|string|`os.hostname()`|
|**host**|string|`"127.0.0.1"`|
|**port**|number|`9999`|
|**application**|string|`process.title`|
|**pid**|string|`process.pid`|
|**tags**|string[]|`["bunyan"]`|

### Adding the bunyan-logstash stream to Bunyan

```javascript
var log = bunyan.createLogger({
  streams: [
    {
      type: "raw",
      stream: require('bunyan-logstash').createStream({
        host: '127.0.0.1',
        port: 5505
      })
    }
  ]
});
```
