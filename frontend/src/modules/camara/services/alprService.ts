const ALPR_TOKEN = import.meta.env.VITE_ALPR_TOKEN || "";

export interface AlprResult {
  plate: string;
  confidence: number;
}

export async function detectPlate(base64Image: string): Promise<AlprResult | null> {
  if (!ALPR_TOKEN) {
    console.warn("VITE_ALPR_TOKEN no configurado");
    return null;
  }

  const base64Data = base64Image.split(",")[1];
  const byteString = atob(base64Data);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  const blob = new Blob([ab], { type: "image/jpeg" });

  const formData = new FormData();
  formData.append("upload", blob, "capture.jpg");

  try {
    const response = await fetch("https://api.platerecognizer.com/v1/plate-reader/", {
      method: "POST",
      headers: { Authorization: `Token ${ALPR_TOKEN}` },
      body: formData,
    });

    const data = await response.json();

    if (!data.results || data.results.length === 0) return null;

    return {
      plate: data.results[0].plate.toUpperCase(),
      confidence: Math.round(data.results[0].score * 100),
    };
  } catch (err) {
    console.error("Error ALPR:", err);
    return null;
  }
}
