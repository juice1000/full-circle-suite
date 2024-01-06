export async function getUsers() {
  try {
    const res = await fetch(
      'https://qqp83s6k4j.execute-api.eu-north-1.amazonaws.com/items'
    );
    const users = res.json();
    return users;
  } catch (err) {
    console.error('getUsers failed', err);
  }
}

export async function updateUser(user: any) {
  try {
    const res = await fetch(
      'https://qqp83s6k4j.execute-api.eu-north-1.amazonaws.com/items',
      {
        method: 'PUT',
        body: JSON.stringify(user),
      }
    );
    const users = res.json();
    return users;
  } catch (err) {
    console.error('updateUser failed', err);
  }
}
