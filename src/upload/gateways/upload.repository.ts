export interface FileOutput {
  fileKey: string;
  type: string;
  userId: string;
  fileName: string;
  fileSize: number;
}

export interface UploadRepository {
  save(
    fileKey: string,
    type: string,
    fileName: string,
    fileSize: number,
  ): Promise<void>;
  findFile(fileKey: string): Promise<FileOutput | null>;
}

