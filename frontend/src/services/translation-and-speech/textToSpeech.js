const backEndPoint = `${
  import.meta.env.VITE_BACKEND_API_URL || "http://localhost:4000"
}/api/tts`;

export const textToSpeech = async (
  text,
  language_code,
  setIsFetchingAudio,
  setIsSpeaking,
  cancelPlaybackRef,
  audioPlayer,
  abortController
) => {
  setIsFetchingAudio(true);
  setIsSpeaking(true);

  if (cancelPlaybackRef.current) return;

  try {
    const response = await fetch(backEndPoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text,
        language_code: language_code,
      }),
      signal: abortController?.signal,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Unknown Error");
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    audioPlayer.current = new Audio(audioUrl);
    setIsFetchingAudio(false);

    await new Promise((resolve) => {
      audioPlayer.current.onended = resolve;
      audioPlayer.current.play();
    });

    URL.revokeObjectURL(audioUrl);
  } catch (error) {
    throw error;
  } finally {
    setIsSpeaking(false);
    setIsFetchingAudio(false);
    cancelPlaybackRef.current = false;
  }
};
