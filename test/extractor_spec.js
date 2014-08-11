extractor = require('../lib/extractor')
expect = require('chai').expect

var testMessage1 = "this is a test text with IP address of 4.4.4.4 and some other irrelevant numbers .1.2.3.4.5.6";
var testMessage2 = "And I am different message about comms from 6.6.6.6 to 192.168.30.1"

describe('#extractIPs', function(){
  it("extracts single IP address correctly", function() {
    var res = extractor.extractIPs(testMessage1)
    expect(res[0].txt).to.equal('4.4.4.4')
  })

  it("returns correct index of the match", function() {
    var res = extractor.extractIPs(testMessage1)
    expect(res[0].index).to.equal(39)
  })

  it("sets a type to ipaddress", function() {
    var res = extractor.extractIPs(testMessage1)
    expect(res[0].type).to.equal('ipaddress')
  })

  it("does not detect SNMP oids as IP addresses", function() {
    var res = extractor.extractIPs(testMessage1)
    expect(res.length).to.equal(1)
  })
  describe(" for multiple IP message", function() {
    var res;
    before(function() {
      res = extractor.extractIPs(testMessage2)
    })
    it("extracts exact amount of messages", function() {
      expect(res.length).to.equal(2)
    })

    it("extracts correct text values", function(){
      expect(res[0].txt).to.equal('6.6.6.6')
      expect(res[1].txt).to.equal('192.168.30.1')
    })
    it("finds correct indexes", function() {
      expect(res[0].index).to.equal(44)
      expect(res[1].index).to.equal(55)
    })
    it("finds correct length", function() {
      expect(res[0].len).to.equal('6.6.6.6'.length)
      expect(res[1].len).to.equal('192.168.30.1'.length)
    })
  })
})

describe("#extractInterfaces", function() {
    var interface_prefixes = ['TenGigabitEthernet', 'GigabitEthernet', 'FastEthernet', 'Ethernet', 'ethernet',
                              'Te', 'Gi', 'Fa', 'Et', 'eth', 'PortChannel', 'port-channel', 'POS',
                              'TenGigE', 'MLAG'
                              ]

    for(var i=0; i < interface_prefixes.length; i++) {
      var iface_pfx = interface_prefixes[i]
      var txt, res, iface_name;
      before(function(){
        if(iface_pfx == 'TenGigE' || iface_pfx == 'MLAG') {
          iface_name = iface_pfx + '5'
        } else {
          iface_name = iface_pfx + '1/5'
        }
        txt = "2014-01-01 test message about " + iface_name + " with some text afterwards."
        res = extractor.extractInterfaces(txt)
      })
      it("extracts interface names with " + iface_pfx + " prefix", function() {
        expect(res[0].txt).to.equal(iface_name)
      })
      it("discovers correct position of interface name for " + iface_pfx, function() {
        expect(res[0].index).to.equal(txt.indexOf(iface_name))
      })
      it("discovers correct length of interface name for " + iface_pfx, function() {
        expect(res[0].len).to.equal(iface_name.length)
      })
      it("sets msg type to interface", function() {
        expect(res[0].type).to.equal('interface')
      })
    }
})


describe("#tokenize", function() {
  describe("for single IP address inside msg", function(){
    var res;
    before(function() {
      var rawmsg = "abcd 10.0.0.2 something"
      res = extractor.tokenize(rawmsg)
    })

    it("tokenizes into 3 element array", function() {
      expect(res.length).to.equal(3)
    })
    it("stores raw text as strings on correct positions", function() {
      expect(res[0].txt).to.equal('abcd ')
      expect(res[2].txt).to.equal(' something')
    })
    it("stores raw text with appropriate type", function() {
      expect(res[0].type).to.equal('text')
      expect(res[2].type).to.equal('text')
    })
    it("stores extracted IP on correct position", function() {
      expect(res[1]).to.deep.equal({ index: 5, len: '10.0.0.2'.length, txt: '10.0.0.2', type: 'ipaddress'})
    })
  })
  describe("for multiple IP addresses", function() {
    var res;
    before(function() {
      res = extractor.tokenize("And I am different message about comms from 6.6.6.6 to 192.168.30.1 or something else")
    })

    it("tokenizes into X element array", function() {
      expect(res.length).to.equal(5)
    })

    it("stores raw text as strings", function() {
      expect(res[0].txt).to.equal('And I am different message about comms from ')
      expect(res[2].txt).to.equal(' to ')
      expect(res[4].txt).to.equal(' or something else')
    })

    it("stores raw text positions", function() {
      expect(res[0].index).to.equal(0)
      expect(res[2].index).to.equal(51)
      expect(res[4].index).to.equal(67)
    })

    it("stores extracted IPs on correct positions", function() {
      expect(res[1]).to.deep.equal({ index: 44, len: '6.6.6.6'.length, txt: '6.6.6.6', type: 'ipaddress'})
      expect(res[3]).to.deep.equal({ index: 55, len: '192.168.30.1'.length, txt: '192.168.30.1', type: 'ipaddress'})
    })
  })

  describe("for multiple interfaces in a message", function() {
    var res;
    before(function() {
      var rawmsg = '2014-01-13 Very important interface Gi0/3 connected to FastEthernet1/5'
      res = extractor.tokenize(rawmsg)
    })
    it("extracts correct number of elements", function() {
      expect(res.length).to.equal(4)
    })
    it("extracts correct interfaces", function() {
      expect(res[0].txt).to.equal('2014-01-13 Very important interface ')
      expect(res[1].txt).to.equal('Gi0/3')
      expect(res[2].txt).to.equal(' connected to ')
      expect(res[3].txt).to.equal('FastEthernet1/5')
    })
  })

  describe("for message with both IP address and interface names", function() {
    var res;
    before(function() {
      res = extractor.tokenize("2015-03-21 Android 1.1.3.3 connected through Fa1/13 to host 5.5.5.5, interface Gi3/1")
    })

    it("does not duplicate the elements while running multiple extractors", function() {
      expect(res.length).to.equal(8)
    })

    it("keeps the order in returned array", function() {
      expect(res[0].txt).to.equal('2015-03-21 Android ')
      expect(res[1].txt).to.equal('1.1.3.3')
      expect(res[2].txt).to.equal(' connected through ')
      expect(res[3].txt).to.equal('Fa1/13')
      expect(res[4].txt).to.equal(' to host ')
      expect(res[5].txt).to.equal('5.5.5.5')
      expect(res[6].txt).to.equal(', interface ')
      expect(res[7].txt).to.equal('Gi3/1')
    })

  })
})