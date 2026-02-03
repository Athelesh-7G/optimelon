const response = await fetch(url, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: apiKey,
  },
  body: JSON.stringify({ text: prompt }),
})
