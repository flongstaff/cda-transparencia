import React from 'react';

interface Document {
  id: string;
  title: string;
  category: string;
  size_mb: number;
  official_url: string;
  archive_url: string;
}

interface DocumentTableProps {
  documents: Document[];
}

const DocumentTable: React.FC<DocumentTableProps> = ({ documents }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>Título</th>
          <th>Categoría</th>
          <th>Tamaño (MB)</th>
          <th>Ver</th>
        </tr>
      </thead>
      <tbody>
        {documents.map(doc => (
          <tr key={doc.id}>
            <td>{doc.title}</td>
            <td>{doc.category}</td>
            <td>{doc.size_mb} MB</td>
            <td>
              <a href={doc.official_url} target="_blank" rel="noreferrer">Oficial</a> | 
              <a href={doc.archive_url} target="_blank" rel="noreferrer">Archivo</a>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DocumentTable;