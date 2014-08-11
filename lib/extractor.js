
exports.extractInterfaces = function(txt) {
  var interface_regexps = [
  /((?:Peer)?(?:(?:TenGigabit|Gigabit|Fast)?[Ee]thernet|Te|Gi|Fa|Et|eth)[0-9]+(?:\/[0-9]+)*(:?\.[0-9]+)?)/g,
  /(Po(?:rt-[cC]hannel)?[0-9]+(:?\.[0-9]+)?)/g,
  /(POS[0-9]+(?:\/[0-9]+)+(:?\.[0-9]+)?)/g,
  /(MLAG\s?[0-9]+(:?\.[0-9]+)?)/g,
  /(TenGigE(?:[0-9]+\/){3}[0-9]+(:?\.[0-9]+)?)/g,
  /(MgmtEth0\/RSP[0-9]+\/CPU[0-9]+\/[0-9]+(:?\.[0-9]+)?)/g,
  /(Bundle-Ether\d+(:?\.[0-9]+)?)/g,
  /(ethernetmgmt[0-9]+)/g,
  ]
  var m, outarr = []

  for(var i=0; i < interface_regexps.length ; i++) {
    var ireg = interface_regexps[i]
    while(m = ireg.exec(txt)) {
      var robj = {
        index: m.index,
        len: m[1].length,
        txt: m[1]
      }
      outarr.push(robj)
    }
  }
  return outarr;
}

exports.extractIPs = function(txt) {
  //
  // space, left square bracket or dash followed by IP
  //
  ipv4_regex = /[\[\- ](\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/g
  var m, outarr=[];
  while(m = ipv4_regex.exec(txt)) {
    var robj = {
      index: m.index + 1,
      len: m[1].length,
      txt: m[1]
    }
    outarr.push(robj);
  }
  return outarr;
}

// helper for sorting by key
function sortKey(arr, key) {
  return arr.sort(function(a,b){
    var x = a[key]; var y = b[key];
    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
  })
};

exports.tokenize = function(txt, extractors) {

  // if no extracors provided, extract the IPs only
  if(extractors == null) {
    extractors = [exports.extractIPs, exports.extractInterfaces];
  }
  var out_arr=[]
  var extracted_fields=[]
  // run each extractor and append results to extracted_fields
  for(var i=0; i < extractors.length; i++){
    var ret = extractors[i](txt)
    extracted_fields = extracted_fields.concat(ret);
  }

  // starty copying
  var curr_pos = 0;
  for(i=0; i < extracted_fields.length; i++) {
    if(curr_pos === txt.length) { break }
    var next_field = extracted_fields[i];
    //copy everything from curr_pos to start of token
    if(curr_pos < next_field.index) {
      var rawstr_to_add = txt.slice(curr_pos, next_field.index)
      out_arr.push({ type: 'txt', txt: rawstr_to_add, len: rawstr_to_add.length, index: curr_pos })
      // ok, now copy the actual field
      out_arr.push(next_field)
      // advance the pointer by whatever we extracted so far
      curr_pos += rawstr_to_add.length + next_field.len
    }
  }

  // at this point we have extracted all tokens, but there still may be something left in the message
  if (curr_pos < txt.length) {
    var remaining_text = txt.slice(curr_pos, txt.length)
    out_arr.push({ type: 'txt', txt: remaining_text, len: remaining_text.length, index: curr_pos })
  }

  // sort by indexes now
  out_arr = sortKey(out_arr, 'index')
  return out_arr
}