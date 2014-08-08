


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

exports.tokenize = function(txt, extractors) {

  // if no extracors provided, extract the IPs only
  if(extractors == null) {
    extractors = [exports.extractIPs];
  }
  var out_arr=[]
  var extracted_fields=[]
  // run each extractor and append results to extracted_fields
  for(var i=0; i < extractors.length; i++){
    var ret = extractors[i](txt)
    extracted_fields = extracted_fields.concat(ret);
  }
  //TODO: sort extracted fields by idx property

  // starty copying
  var curr_pos = 0;
  for(i=0; i < extracted_fields.length; i++) {
    if(curr_pos === txt.length) { break }
    var next_field = extracted_fields[i];
    //copy everything from curr_pos to start of token
    if(curr_pos < next_field.index) {
      var rawstr_to_add = txt.slice(curr_pos, next_field.index)
      out_arr.push(rawstr_to_add)
      // ok, now copy the actual field
      out_arr.push(next_field)
      // advance the pointer by whatever we extracted so far
      curr_pos += rawstr_to_add.length + next_field.len
    }
  }

  // at this point we have extracted all tokens, but there still may be something left in the message
  if (curr_pos < txt.length) {
    out_arr.push(txt.slice(curr_pos, txt.length))
  }
  return out_arr
}