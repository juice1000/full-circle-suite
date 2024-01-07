export async function getUsers() {
  try {
    const res = await fetch(
      'https://aakgvcpt1b.execute-api.ap-southeast-1.amazonaws.com/items'
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
      'https://aakgvcpt1b.execute-api.ap-southeast-1.amazonaws.com/items',
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
