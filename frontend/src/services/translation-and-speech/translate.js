const backEndPoint = `${import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:4000'}/api/translation`;

export const handleTranslation = async (text, targetLanguage) => {
    console.log(targetLanguage);
  try {
    const response = await fetch(backEndPoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({text : text, language_code: targetLanguage }),
    });

    if (!response.ok) throw new Error(`HTTP error ${response.status}`);

    const data = await response.json();
    return data.translation;
  } catch (err) {
    console.error('Translation Error:', err);
    return text; // fallback
  }
};
