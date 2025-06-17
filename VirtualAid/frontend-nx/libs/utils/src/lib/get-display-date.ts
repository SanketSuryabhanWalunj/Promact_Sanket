export function getDisplayDate(dateString: string) {
  const date = new Date(dateString);

  return `${date.toLocaleString('en-US', {
    month: 'long',
  })} ${date.getDate()}, ${date.getFullYear()}`;
}

export default getDisplayDate;
