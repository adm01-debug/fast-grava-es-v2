import { fileTypeFromBuffer } from 'file-type';

/**
 * Validates a file using magic bytes to ensure it matches allowed types.
 * @param file The file to validate
 * @param allowedMimeTypes Array of allowed MIME types (e.g. ['image/jpeg', 'image/png'])
 * @returns { Promise<{ isValid: boolean, error?: string }> }
 */
export async function validateFileMagicBytes(
  file: File, 
  allowedMimeTypes: string[] = ['image/jpeg', 'image/png', 'image/webp']
): Promise<{ isValid: boolean, error?: string }> {
  try {
    const buffer = await file.arrayBuffer();
    const type = await fileTypeFromBuffer(buffer);

    if (!type) {
      return { 
        isValid: false, 
        error: 'Não foi possível determinar o tipo real do arquivo.' 
      };
    }

    if (!allowedMimeTypes.includes(type.mime)) {
      return { 
        isValid: false, 
        error: `Tipo de arquivo inválido: ${type.mime}. Esperado: ${allowedMimeTypes.join(', ')}.` 
      };
    }

    return { isValid: true };
  } catch (error) {
    return { 
      isValid: false, 
      error: 'Erro ao validar a integridade do arquivo.' 
    };
  }
}
