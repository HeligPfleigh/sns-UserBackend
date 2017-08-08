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

function chunkString(str, length) {
  return str.match(new RegExp(`.{1,${length}}`, 'g'));
}

function splitWord(word) {
  const length = word.length;
  let result = '';
  for (let i = 1; i < length; i++) {
    result += ` ${chunkString(word, i).join(' ')}`;
  }
  return result;
}

export function generateUserSearchField(user) {
  let search = '';
  if (user && user.profile && user.profile.firstName) {
    search += `${user.profile.firstName.trim()} `;
  }
  if (user && user.profile && user.profile.lastName) {
    search += `${user.profile.lastName.trim()} `;
  }
  // search = first name + last name
  if (search.length > 0) {
    search = search.trim();
    search = `${removeToneVN(search)} ${search}`;
  }
  // split to one word
  const os = search.split(' ').filter((item, pos, self) => self.indexOf(item) === pos);

  for (let i = 0; i < os.length; i++) {
    search += ` ${splitWord(os[i])}`;
  }
  return search;
}

export function generateBuildingSearchField(building) {
  let search = '';
  if (building && building.name) {
    search += `${building.name.trim()} `;
  }
  // search = first name + last name
  if (search.length > 0) {
    search = search.trim();
    search = `${removeToneVN(search)} ${search}`;
  }
  // split to one word
  const os = search.split(' ').filter((item, pos, self) => self.indexOf(item) === pos);
  for (let i = 0; i < os.length; i++) {
    search += ` ${splitWord(os[i])}`;
  }
  return search;
}
