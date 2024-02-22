export async function getMessages(id: string) {
  try {
    const res = await fetch(
      `https://37rv6wgrp7.execute-api.ap-southeast-1.amazonaws.com/items?id=${id}`
    );

    const messages = res.json();
    return messages;
  } catch (err) {
    console.error('getMessages failed', err);
  }
}
