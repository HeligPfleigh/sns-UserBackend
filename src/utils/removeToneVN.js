export default function removeToneVN(str) {
  let strRemoved = str;
  strRemoved = strRemoved.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  strRemoved = strRemoved.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  strRemoved = strRemoved.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  strRemoved = strRemoved.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  strRemoved = strRemoved.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  strRemoved = strRemoved.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  strRemoved = strRemoved.replace(/đ/g, 'd');

  strRemoved = strRemoved.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'A');
  strRemoved = strRemoved.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, 'E');
  strRemoved = strRemoved.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, 'I');
  strRemoved = strRemoved.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'O');
  strRemoved = strRemoved.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, 'U');
  strRemoved = strRemoved.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, 'Y');
  strRemoved = strRemoved.replace(/Đ/g, 'D');

  return strRemoved;
}
