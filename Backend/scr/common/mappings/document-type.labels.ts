import { DocumentType } from '../enums/document-type.enum.js';

export const DocumentTypeLabels: Record<DocumentType, string> = {
  [DocumentType.DNI]: 'DNI',
  [DocumentType.PASSPORT]: 'Pasaporte',
  [DocumentType.CI]: 'Cédula de Identidad',
  [DocumentType.LC]: 'Libreta Cívica',
  [DocumentType.LE]: 'Libreta de Enrolamiento',
};