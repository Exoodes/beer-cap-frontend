export const getImageUrl = (url: string): string => {
  if (!url) return "";
  
  if (url.includes("http://minio:9000")) {
    return url.replace("http://minio:9000", "http://localhost:9000");
  }
  
  return url;
};