export const uploadToCloudinary = async (base64Image: string) => {
  if (!base64Image.startsWith("data:image")) return base64Image;

  const formData = new FormData();
  formData.append("file", base64Image);
  formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );

  const data = await res.json();
  return data.secure_url; // Yeh aapko "https://res.cloudinary.com/..." wala URL dega
};