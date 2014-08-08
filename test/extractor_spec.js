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
      expect(res[0]).to.equal('abcd ')
      expect(res[2]).to.equal(' something')
    })
    it("stores extracted IP on correct position", function() {
      expect(res[1]).to.deep.equal({ index: 5, len: '10.0.0.2'.length, txt: '10.0.0.2'})
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

    it("stores raw text as strings on correct positions", function() {
      expect(res[0]).to.equal('And I am different message about comms from ')
      expect(res[2]).to.equal(' to ')
      expect(res[4]).to.equal(' or something else')
    })

    it("stores extracted IPs on correct positions", function() {
      expect(res[1]).to.deep.equal({ index: 44, len: '6.6.6.6'.length, txt: '6.6.6.6'})
      expect(res[3]).to.deep.equal({ index: 55, len: '192.168.30.1'.length, txt: '192.168.30.1'})
    })



  })
})