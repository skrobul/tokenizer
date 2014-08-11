This module solves the problem of extracing IP addresses and Cisco / Arista interface names from a text. It was initially written to be used for parsing syslog files, but can be used anywhere such need exists.


# Installation


# Usage 
Functionality of this module has been split into three functions
## Convert string into tokens
```
tokenizer.tokenize(txt, extractors)
```

### Params
* `txt` - (Required) raw string that is to be parsed
* `extractors` - (Optional) - array of functions that perform extraction and return list of objects describing extracted fields. If not provided, by default `extractIPs` and `extractInterfaces` are used. If you want to write your own method, have a look at one of those functions.

### Returns
Returns an array of objects describing consecutive fields. 
Each object contains at least following attributes:
* `index` - start position in input string
* `len` - length of extracted field
* `type` - set to appropriate type of the extraction. All parts of the string that have not been matched by `extractors` have this parameter set to `'text'`

### Example
```
> tokenizer.tokenize("2015-03-21 Android 1.1.3.3 connected through Fa1/13 to host 5.5.5.5, interface Gi3/1")
[
   {
      "type":"text",
      "txt":"2015-03-21 Android ",
      "len":19,
      "index":0
   },
   {
      "index":19,
      "len":7,
      "txt":"1.1.3.3",
      "type":"ipaddress"
   },
   {
      "type":"text",
      "txt":" connected through ",
      "len":19,
      "index":26
   },
   {
      "index":45,
      "len":6,
      "txt":"Fa1/13",
      "type":"interface"
   },
   {
      "type":"text",
      "txt":" to host ",
      "len":9,
      "index":51
   },
   {
      "index":60,
      "len":7,
      "txt":"5.5.5.5",
      "type":"ipaddress"
   },
   {
      "type":"text",
      "txt":", interface ",
      "len":12,
      "index":67
   },
   {
      "index":79,
      "len":5,
      "txt":"Gi3/1",
      "type":"interface"
   }
]
>
```



## Extract list of Cisco/Arista interface names
`tokenizer.extractInterfaces(txt)`
### Params
* `txt` - (Required) - string to be parsed
### Returns
Array with list of extracted IP address objects. Each object has following attributes:
* `index` - start position in input string
* `len` - length of extracted field
* `type` - set to `'interface'`

### Example
```
> tokenizer.extractInterfaces('2014-03-12 host.com Interface Ethernet1/4 went down')
[ { index: 30,
    len: 11,
    txt: 'Ethernet1/4',
    type: 'interface' } ]
>
```

## Extract IP addresses
`tokenizer.extractIPs(txt)`

### Params
* `txt` - (Required) - string to be parsed

### Returns
Array with list of extracted IP address objects. Each object has following attributes:
* `index` - start position in input string
* `len` - length of extracted field
* `type` - set to `'ipaddress'`

### Example
```
> tokenizer.extractIPs("this is a test text with IP address of 4.4.4.4 and some other irrelevant SNMP OID .1.2.3.4.5.6")
[{"index":39,"len":7,"txt":"4.4.4.4","type":"ipaddress"}]
```


