export function getInitials(name: string) {
  if (name) {
    const nameArr = name.split(' ');
    let initialsChar = '';
    const minLength = nameArr.length > 2 ? 2 : nameArr.length;
    for (let i = 0; i < minLength; i++) {
      initialsChar = initialsChar + nameArr[i][0];
    }
    return initialsChar.toUpperCase();
  } else {
    return '';
  }
}

export default getInitials;
