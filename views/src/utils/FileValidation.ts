export const validateFileType = (file: File, validExtensions: string[]) => {
  const fileExtension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
  return validExtensions.includes(fileExtension);
};