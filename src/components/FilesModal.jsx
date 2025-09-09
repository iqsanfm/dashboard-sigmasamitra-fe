import React from 'react';

const FilesModal = ({ isOpen, onClose, files }) => {
  if (!isOpen) return null;

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  console.log('FilesModal: API_BASE_URL', API_BASE_URL);
  console.log('FilesModal: files', files);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
      <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white">
        <h3 className="text-lg font-bold mb-4">Bukti Pekerjaan</h3>
        {files.length > 0 ? (
          <ul className="space-y-2">
            {files.map((file) => (
              <li key={file.file_id} className="flex items-center justify-between p-2 border rounded-md">
                <a
                  href={`${API_BASE_URL}${file.file_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline truncate"
                >
                  {file.original_filename}
                </a>
                <span className="text-sm text-gray-500 ml-2">({(file.file_size / 1024).toFixed(2)} KB)</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>Tidak ada bukti pekerjaan yang diunggah.</p>
        )}
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilesModal;